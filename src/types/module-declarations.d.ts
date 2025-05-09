declare module 'react-native-html-to-pdf' {
  interface RNHTMLtoPDFOptions {
    html: string;
    fileName?: string;
    directory?: string;
    base64?: boolean;
    height?: number;
    width?: number;
    padding?: number;
  }

  interface RNHTMLtoPDFResponse {
    filePath: string;
    base64?: string;
  }

  export default {
    convert(options: RNHTMLtoPDFOptions): Promise<RNHTMLtoPDFResponse>;
  };
}

declare module 'react-native-share' {
  interface ShareOptions {
    title?: string;
    message?: string;
    url: string;
    type?: string;
    subject?: string;
  }

  export default {
    open(options: ShareOptions): Promise<any>;
  };
}

declare module 'react-native-fs' {
  export const DocumentDirectoryPath: string;
  export const ExternalDirectoryPath: string;
  export const ExternalStorageDirectoryPath: string;
  export const TemporaryDirectoryPath: string;
  export const LibraryDirectoryPath: string;
  export const PicturesDirectoryPath: string;
  export const CachesDirectoryPath: string;
  export const MainBundlePath: string;
  
  export function readFile(path: string, encoding?: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding?: string): Promise<void>;
  export function exists(path: string): Promise<boolean>;
  export function stat(path: string): Promise<StatResult>;
  export function mkdir(path: string): Promise<void>;
  export function unlink(path: string): Promise<void>;
  
  interface StatResult {
    name: string;
    path: string;
    size: number;
    isFile(): boolean;
    isDirectory(): boolean;
  }
}

declare module 'react-native-view-shot' {
  import { ViewProps } from 'react-native';
  
  export interface CaptureOptions {
    format?: 'png' | 'jpg' | 'jpeg' | 'webm' | 'raw';
    quality?: number;
    result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
    width?: number;
    height?: number;
    snapshotContentContainer?: boolean;
  }
  
  export default class ViewShot extends React.Component<ViewProps & {
    onCapture?: (uri: string) => void;
    captureMode?: 'mount' | 'continuous' | 'update';
    options?: CaptureOptions;
  }> {
    capture(): Promise<string>;
  }
  
  export function captureRef(
    viewRef: React.RefObject<any>,
    options?: CaptureOptions
  ): Promise<string>;
  
  export function captureScreen(options?: CaptureOptions): Promise<string>;
}

// Add any custom module declarations here

declare module 'react-native-print' {
  interface PrintOptions {
    html?: string;
    printerURL?: string;
    isLandscape?: boolean;
    jobName?: string;
    htmlHeight?: number;
    htmlWidth?: number;
    fileName?: string;
  }

  interface PrintPDFOptions {
    html: string;
    fileName?: string;
    height?: number;
    width?: number;
    paddingLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    base64?: boolean;
  }

  interface SelectPrinterOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }

  export function print(options: PrintOptions): Promise<void>;
  export function printToFile(options: PrintPDFOptions): Promise<string>;
  export function selectPrinter(options?: SelectPrinterOptions): Promise<string>;
  export function silentPrint(options: PrintOptions): Promise<void>;
}

declare module 'react-native-webview' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface WebViewProps extends ViewProps {
    source?: { uri: string } | { html: string };
    originWhitelist?: string[];
    onLoad?: () => void;
    onLoadEnd?: () => void;
    injectedJavaScript?: string;
    javaScriptEnabled?: boolean;
  }

  export default class WebView extends Component<WebViewProps> {}
} 