# Wake-Word Model Training Guide ("eindr")

This guide explains **exactly** what data you must collect, how to train a new Random-Forest wake-word model, and how to deploy it back into the React-Native mobile app.

---

## 1. Data you need

| Category     | Amount           | Description                                                                                                                             | Examples                              |
| ------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Positive** | ≥ 300 utterances | Clean recordings of _one person at a time_ clearly saying **“eindr”**. Record in different rooms, microphones, distances &amp; accents. | `data/positives/user01_eindr_001.wav` |
| **Negative** | ≥ 30 minutes     | Anything _except_ the wake-word: background noise, music, podcasts, other words. Mix loud/quiet and clean/noisy material.               | `data/negatives/noise_kitchen.wav`    |

**Audio format**

- Mono, **16-kHz**, 16-bit PCM (`*.wav`).
- Each file **≥ 2 seconds** (the training script will pad/trim to 2 s exactly).

---

## 2. Directory layout

```
project-root/
 ├─ data/
 │   ├─ positives/      # all wake-word wavs
 │   └─ negatives/      # everything else
 ├─ scripts/
 │   └─ train_wakeword.py
 └─ precise_lite_model/ # artefacts will be written here
```

---

## 3. Install training dependencies (Python ≥ 3.9)

```bash
python -m venv .venv && source .venv/bin/activate
pip install librosa numpy scikit-learn joblib skl2onnx soundfile tqdm
```

---

## 4. Run the training script

```bash
python scripts/train_wakeword.py \
    --positives data/positives/*.wav \
    --negatives data/negatives/*.wav \
    --out_dir precise_lite_model \
    --n_estimators 300 \          # optional
    --threshold 0.6               # runtime confidence threshold
```

The script will:

1. Extract **52-dim MFCC** feature vectors.
2. Fit `StandardScaler` + `RandomForestClassifier`.
3. Export four artefacts into `precise_lite_model/`:
   - `eindr_random_forest.pkl` – raw sklearn model (for audits)
   - `eindr_random_forest_scaler.pkl` – scaler (for audits)
   - `eindr_random_forest.onnx` – runtime model
   - `eindr_rf_config.json` – MFCC + threshold parameters

A training summary (precision/recall/F1) is printed to the console.

---

## 5. Deploy to the mobile app

1. Copy **`eindr_random_forest.onnx`**, **`eindr_rf_config.json`** and **`eindr_scaler.onnx`** (created automatically by the script) to:
   - `assets/models/` (JS bundle)
   - `android/app/src/main/assets/models/` (Android)
   - `ios/Eindr/Fonts/../models/` (iOS) – ensure they are added to the Xcode project.
2. Commit the new files.
3. (Optional) Adjust the threshold at runtime by editing `src/services/wakeword/RandomForestWakeWordEngine.ts` → `config.threshold`.

---

## 6. Validating on-device

1. Run **Metro** with cache reset:
   ```bash
   npx react-native start --reset-cache
   ```
2. Re-install the app:
   ```bash
   npm run android        # or npm run ios
   ```
3. Watch the console. With `DEBUG = true` you’ll see logs like:
   ```
   [WakeWord 12:34:56.789] Confidence: 0.012
   ...
   [WakeWord 12:34:59.101] 🛑 WAKE-WORD DETECTED! conf=0.883
   ```

---

## 7. Tips for better accuracy

- **Class balance** – keep ~1:3 positive:negative ratio when fitting.
- **Data diversity** – record on multiple devices &amp; rooms.
- **Silence trimming** – leave ~0.3 s silence _before_ &amp; _after_ the wake-word.
- **Threshold tuning** – aim for ≤ 1 false-positive per hour.

---

Happy training! 🎙️🤖
