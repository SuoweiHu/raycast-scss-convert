import { LocalStorage } from "@raycast/api";
import { exec } from "child_process";
import { getPref_deleteCSS, getPref_deleteSourceMap, getPref_sassCompilerPath } from "./util_preference";
import { delayOperation } from "./util_other";
import { error } from "console";
import { stderr, stdout } from "process";
import { resolve } from "path";
import { rejects } from "assert";


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

export async function get_LocalConfig_prev() {
    return Promise.all([
        LocalStorage.getItem<string>("prev_scssPath"),
        LocalStorage.getItem<string>("prev_cssPath"),
        LocalStorage.getItem<string>("prev_outputStyle"),
        LocalStorage.getItem<string>("prev_sourceMap"),
        LocalStorage.getItem<string>("prev_watchCompile"),
    ]);
}
export async function set_LocalConfig_prev(conf: CompileConfig) {
    return Promise.all([
        LocalStorage.setItem("prev_scssPath", conf.scssPath),
        LocalStorage.setItem("prev_cssPath", conf.cssPath),
        LocalStorage.setItem("prev_outputStyle", conf.outputStyle),
        LocalStorage.setItem("prev_sourceMap", conf.sourceMap),
        LocalStorage.setItem("prev_watchCompile", conf.watchCompile),
    ]);
}
export async function remove_LocalConfig_prev() {
    return Promise.all([
        LocalStorage.removeItem(`prev_scssPath`),
        LocalStorage.removeItem(`prev_cssPath`),
        LocalStorage.removeItem(`prev_outputStyle`),
        LocalStorage.removeItem(`prev_sourceMap`),
        LocalStorage.removeItem(`prev_watchCompile`),
    ]);
}

// ██████████████████████████████████████████████████████████████████████████████
// Certain ID's Config Related

export async function set_LocalConfig_id(id: string, conf: CompileConfig) {
    return Promise.all([
        LocalStorage.setItem(`${id}_scssPath`, conf.scssPath),
        LocalStorage.setItem(`${id}_cssPath`, conf.cssPath),
        LocalStorage.setItem(`${id}_outputStyle`, conf.outputStyle),
        LocalStorage.setItem(`${id}_sourceMap`, conf.sourceMap),
        LocalStorage.setItem(`${id}_watchCompile`, conf.watchCompile),
    ]);
}
export async function get_LocalConfig_id(id: string) {
    return Promise.all([
        LocalStorage.getItem<string>(`${id}_scssPath`),
        LocalStorage.getItem<string>(`${id}_cssPath`),
        LocalStorage.getItem<string>(`${id}_outputStyle`),
        LocalStorage.getItem<string>(`${id}_sourceMap`),
        LocalStorage.getItem<string>(`${id}_watchCompile`),
    ]);
}
export async function remove_LocalConfig_id(id: string) {
    return Promise.all([
        LocalStorage.removeItem(`${id}_scssPath`),
        LocalStorage.removeItem(`${id}_cssPath`),
        LocalStorage.removeItem(`${id}_outputStyle`),
        LocalStorage.removeItem(`${id}_sourceMap`),
        LocalStorage.removeItem(`${id}_watchCompile`),
    ]);
}

// ██████████████████████████████████████████████████████████████████████████████
// Count Related

export async function update_LocalConfig_count(delta: number = 1) {
    LocalStorage.getItem(`count`).then((data) => {
        let count = data as number;        if(count == undefined){count=0;}
        let update_count = count + delta;  if(update_count<0){update_count=0;}
        return LocalStorage.setItem(`count`, update_count);
    });
}
export async function read_LocalConfig_count() {
    return update_LocalConfig_count(0);
}
export async function add_LocalConfig_count() {
    return update_LocalConfig_count(1);
}
export async function remove_LocalConfig_count() {
    return update_LocalConfig_count(-1);
}
export async function reset_LocalConfig_count() {
    return LocalStorage.setItem(`count`, 0);
}

// ██████████████████████████████████████████████████████████████████████████████
// Compilation Related

export type CompileResult = {
    success: boolean,
    message: string
}

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
    if (getPref_deleteCSS()) { exec(`/bin/rm -rf "${compile_cssPath}"`); await delayOperation(100); }
    if (getPref_deleteSourceMap()) { exec(`/bin/rm -rf "${compile_cssPath}.map"`); await delayOperation(100); }

    return new Promise<CompileResult>((resolve, reject) => {
        exec(compile_cmd, { shell: "/bin/zsh", env: { ...process.env, PATH: "/opt/homebrew/bin" } }, async (error, stderr, stdout) => {
            if (error == null || error == undefined) {
                resolve({ success: true, message: stdout });
            }
            else {
                if(stdout.includes("no such file or directory")){
                    reject({ success: false, message: "File Not Found"});
                } else{
                    reject({ success: false, message: "Unknown Error"});
                }
            }
        });
    });
}

// ██████████████████████████████████████████████████████████████████████████████

