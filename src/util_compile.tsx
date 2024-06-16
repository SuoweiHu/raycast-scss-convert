import { LocalStorage } from "@raycast/api";
import { exec } from "child_process";
import { getPref_deleteCSS, getPref_deleteSourceMap, getPref_sassCompilerPath } from "./util_preference";
import { delayOperation } from "./util_other";

// ██████████████████████████████████████████████████████████████████████████████
// Type/Default Config Related

export type CompileConfig = {
  scssPath: string;
  cssPath: string;
  outputStyle: string;
  sourceMap: string;
  watchCompile: boolean;
};

export const default_config: CompileConfig = {
  scssPath: "",
  cssPath: "",
  outputStyle: "expanded",
  sourceMap: "auto",
  watchCompile: false,
};

// ██████████████████████████████████████████████████████████████████████████████
// Prev Config Related

export async function get_LocalConfig_prev(): Promise<CompileConfig> {
  return new Promise<CompileConfig>((resolve, reject) => {
    LocalStorage.getItem("prev_config").then((data) => {
      if (data == undefined) {
        reject(default_config);
      } else {
        const _config_: CompileConfig = JSON.parse(data as string);
        _config_.cssPath = _config_.cssPath == undefined ? "" : _config_.cssPath;
        _config_.scssPath = _config_.cssPath == undefined ? "" : _config_.scssPath;
        resolve(_config_);
      }
    });
  });
}
export async function set_LocalConfig_prev(conf: CompileConfig) {
  return LocalStorage.setItem("prev_config", JSON.stringify(conf));
}
export async function remove_LocalConfig_prev() {
  return LocalStorage.removeItem("prev_config");
}

// ██████████████████████████████████████████████████████████████████████████████
// Watch Config Related

export async function getAll_LocalConfig_watch(): Promise<CompileConfig[]> {
  return new Promise<CompileConfig[]>((resolve) => {
    LocalStorage.getItem("watch_configs").then((data) => {
      if (data == undefined) {
        resolve([]);
      } else {
        resolve(JSON.parse(data as string) as CompileConfig[]);
      }
    });
  });
}
export async function add_LocalConfig_watch(_conf_: CompileConfig): Promise<string> {
  return new Promise<string>((resolve) => {
    getAll_LocalConfig_watch().then((configs) => {
      // Check if config of same sass-path + css-path exist, if do then remove it
      let msg: string = "";
      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        if (config.cssPath == _conf_.cssPath && config.scssPath == _conf_.scssPath) {
          configs.splice(i, 1);
          msg = "updated duplicate";
        }
      }
      configs.push(_conf_);
      LocalStorage.setItem("watch_configs", JSON.stringify(configs));
      resolve(msg);
    });
  });
}
export async function remove_LocalConfig_watch(_conf_: CompileConfig) {
  return new Promise<void>((resolve, reject) => {
    getAll_LocalConfig_watch().then((configs) => {
      // Check if config of same sass-path + css-path exist, if do then remove it
      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        if (config.cssPath == _conf_.cssPath && config.scssPath == _conf_.scssPath) {
          configs.splice(i, 1);
        }
        LocalStorage.setItem("watch_configs", JSON.stringify(configs));
        resolve();
      }
      // If no duplicate found then throw warning
      reject("No such configuration can be found");
    });
  });
}
export async function removeAll_LocalConfigs_watch() {
  return LocalStorage.removeItem("watch_configs");
}

// ██████████████████████████████████████████████████████████████████████████████
// Compilation Related

export type CompileResult = {
  success: boolean;
  message: string;
};

export async function exec_compile(conf: CompileConfig): Promise<CompileResult> {
  const compile_scssPath: string = conf.scssPath.toLowerCase().endsWith(".scss")
    ? conf.scssPath
    : conf.scssPath + "/style.scss";
  const compile_cssPath: string = conf.cssPath.toLowerCase().endsWith(".css")
    ? conf.cssPath
    : conf.cssPath + "/style.css";
  const compile_option_outputStyle: string = `--style=${conf.outputStyle}`;
  const compile_option_sourceMap: string =
    conf.sourceMap == "auto"
      ? ""
      : conf.sourceMap == "none"
        ? "--no-source-map"
        : conf.sourceMap == "inline"
          ? "--embed-source-map"
          : conf.sourceMap == "file"
            ? ""
            : "";
  const compile_options = compile_option_outputStyle + " " + compile_option_sourceMap;
  const compile_execPath = getPref_sassCompilerPath();
  const compile_cmd: string = `${compile_execPath} ${compile_options} "${compile_scssPath}" "${compile_cssPath}"`;
  if (getPref_deleteCSS()) {
    exec(`/bin/rm -rf "${compile_cssPath}"`);
    await delayOperation(100);
  }
  if (getPref_deleteSourceMap()) {
    exec(`/bin/rm -rf "${compile_cssPath}.map"`);
    await delayOperation(100);
  }

  return new Promise<CompileResult>((resolve, reject) => {
    exec(
      compile_cmd,
      { shell: "/bin/zsh", env: { ...process.env, PATH: "/opt/homebrew/bin" } },
      async (error, stderr, stdout) => {
        if (error == null || error == undefined) {
          resolve({ success: true, message: stdout });
        } else {
          if (stdout.includes("no such file or directory")) {
            reject({ success: false, message: "File Not Found" });
          } else {
            reject({ success: false, message: "Unknown Error" });
          }
        }
      },
    );
  });
}

// ██████████████████████████████████████████████████████████████████████████████
