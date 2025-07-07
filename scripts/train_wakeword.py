#!/usr/bin/env python3
"""
train_wakeword.py – minimal example to train a Random-Forest wake-word model for
React-Native (Eindr).

Usage:
    python train_wakeword.py \
        --positives data/eindr/*.wav \
        --negatives data/negatives/*.wav \
        --out_dir precise_lite_model

Makes four artefacts:
    * eindr_random_forest.pkl        – sklearn RandomForest model         (binary)
    * eindr_scaler.pkl               – sklearn StandardScaler             (binary)
    * eindr_random_forest.onnx       – model converted to ONNX            (binary)
    * eindr_rf_config.json           – JSON with MFCC + threshold params  (text)
Copy the *.onnx + *.json files into:
    assets/models/                  (Android & iOS)

Requirements:
    pip install librosa numpy scikit-learn joblib skl2onnx soundfile tqdm
"""
import argparse
import json
import os
import pathlib

import joblib
import librosa
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.preprocessing import StandardScaler
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from tqdm import tqdm

SAMPLE_RATE = 16_000
WINDOW_DURATION = 2.0  # seconds
N_MFCC = 13
N_FFT = 512
HOP_LENGTH = 160  # 10 ms @16kHz


def extract_features(wav_path: str) -> np.ndarray:
    """Load wav → 52-d feature vector (same as RN runtime)."""
    y, sr = librosa.load(wav_path, sr=SAMPLE_RATE, mono=True)
    # pad / trim to 2 s
    target_len = int(SAMPLE_RATE * WINDOW_DURATION)
    if len(y) < target_len:
        y = np.pad(y, (0, target_len - len(y)))
    else:
        y = y[:target_len]

    mfcc = librosa.feature.mfcc(
        y=y,
        sr=sr,
        n_mfcc=N_MFCC,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
    )
    feats = []
    for row in mfcc:
        feats.extend([row.mean(), row.std(), row.max(), row.min()])
    return np.asarray(feats, dtype=np.float32)


def load_dataset(files: list[str], label: int):
    X, y = [], []
    for f in tqdm(files, desc=f"label={label}"):
        X.append(extract_features(f))
        y.append(label)
    return np.stack(X), np.asarray(y)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--positives", nargs="+", required=True, help="glob(s) for positive wakeword wavs")
    ap.add_argument("--negatives", nargs="+", required=True, help="glob(s) for negative wavs")
    ap.add_argument("--out_dir", default="model", help="where to write artefacts")
    ap.add_argument("--n_estimators", type=int, default=200)
    ap.add_argument("--threshold", type=float, default=0.5, help="probability threshold for runtime")
    args = ap.parse_args()

    pos_files = sum([list(pathlib.Path().glob(g)) for g in args.positives], [])
    neg_files = sum([list(pathlib.Path().glob(g)) for g in args.negatives], [])

    X_pos, y_pos = load_dataset([str(p) for p in pos_files], 1)
    X_neg, y_neg = load_dataset([str(p) for p in neg_files], 0)

    X = np.concatenate([X_pos, X_neg])
    y = np.concatenate([y_pos, y_neg])

    scaler = StandardScaler().fit(X)
    X_scaled = scaler.transform(X)

    rf = RandomForestClassifier(
        n_estimators=args.n_estimators,
        n_jobs=-1,
        class_weight="balanced",
        random_state=42,
    ).fit(X_scaled, y)

    print(classification_report(y, rf.predict(X_scaled)))

    out = pathlib.Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    joblib.dump(rf, out / "eindr_random_forest.pkl")
    joblib.dump(scaler, out / "eindr_random_forest_scaler.pkl")

    initial_type = [("input", FloatTensorType([None, X.shape[1]]))]
    onnx_model = convert_sklearn(rf, initial_types=initial_type, target_opset=13)
    with open(out / "eindr_random_forest.onnx", "wb") as f:
        f.write(onnx_model.SerializeToString())

    cfg = {
        "sample_rate": SAMPLE_RATE,
        "window_duration": WINDOW_DURATION,
        "n_mfcc": N_MFCC,
        "n_fft": N_FFT,
        "hop_length": HOP_LENGTH,
        "threshold": args.threshold,
    }
    with open(out / "eindr_rf_config.json", "w") as f:
        json.dump(cfg, f, indent=2)

    print("Models & config saved to", out)


if __name__ == "__main__":
    main() 