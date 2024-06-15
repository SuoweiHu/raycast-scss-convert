import { LocalStorage } from "@raycast/api";
import { exec } from "child_process";
import { getPref_deleteCSS, getPref_deleteSourceMap, getPref_sassCompilerPath } from "./util_preference";
import { delayOperation } from "./util_other";

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

export async function get_LocalConfig() {
  return Promise.all([
    LocalStorage.getItem<string>("prev_scssPath"),
    LocalStorage.getItem<string>("prev_cssPath"),
    LocalStorage.getItem<string>("prev_outputStyle"),
    LocalStorage.getItem<string>("prev_sourceMap"),
    LocalStorage.getItem<string>("prev_watchCompile"),
  ]);
}
export async function set_LocalConfig(conf: CompileConfig) {
  return Promise.all([
    LocalStorage.setItem("prev_scssPath", conf.scssPath),
    LocalStorage.setItem("prev_cssPath", conf.cssPath),
    LocalStorage.setItem("prev_outputStyle", conf.outputStyle),
    LocalStorage.setItem("prev_sourceMap", conf.sourceMap),
    LocalStorage.setItem("prev_watchCompile", conf.watchCompile),
  ]);
}

export async function exec_compile(conf: CompileConfig) {
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
  const compile_execPath= getPref_sassCompilerPath();
  const compile_cmd: string = `${compile_execPath} ${compile_options} "${compile_scssPath}" "${compile_cssPath}"`;
  if(getPref_deleteCSS())      {exec(`/bin/rm -rf "${compile_cssPath}"`);     await delayOperation(100);}
  if(getPref_deleteSourceMap()){exec(`/bin/rm -rf "${compile_cssPath}.map"`); await delayOperation(100);}
  exec(compile_cmd, { shell: "/bin/zsh", env: { ...process.env, PATH: "/opt/homebrew/bin" } });
}
