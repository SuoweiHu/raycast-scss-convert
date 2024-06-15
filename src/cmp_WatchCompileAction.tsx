import { Action, ActionPanel, Toast, showHUD, showToast } from "@raycast/api";
import { CompileConfig, CompileResult, default_config, exec_compile, remove_LocalConfig_prev, set_LocalConfig_prev } from "./util_compile";
import { Dispatch } from "react";

// Action for the watch compile form
export function WatchCompileAction(props:{config:CompileConfig, set_config:Dispatch<React.SetStateAction<CompileConfig>>}) {
    return (
      <ActionPanel>
        <Action.SubmitForm
          title="Compile (and Save Configuration)"
          onSubmit={(values) => {
            const cur_config: CompileConfig = {
              scssPath: values.scssPath[0] == null ? "" : values.scssPath[0],
              cssPath: values.cssPath[0] == null ? "" : values.cssPath[0],
              outputStyle: values.outputStyle,
              sourceMap: values.sourceMap,
              watchCompile: false,
            };
            exec_compile(cur_config)
              .then(() => {
                showHUD("✅ File has been Compiled");
              })
              .catch((result: CompileResult) => {
                showToast({ title: `Compile Failed: ${result.message} !`, style: Toast.Style.Failure });
              });
          }}
        />
        <Action.SubmitForm
          title="Save Configuration"
          shortcut={{ modifiers: ["cmd"], key: "s" }}
          onSubmit={(values) => {
            const cur_config: CompileConfig = {
              scssPath: values.scssPath[0] == null ? "" : values.scssPath[0],
              cssPath: values.cssPath[0] == null ? "" : values.cssPath[0],
              outputStyle: values.outputStyle,
              sourceMap: values.sourceMap,
              watchCompile: false,
            };
            set_LocalConfig_prev(cur_config);
            showToast({ title: "⚙️\tConfiguration Saved", style: Toast.Style.Success });
          }}
        />
        <Action
                title="Reset to Default Config"
                shortcut={{ modifiers: ["cmd"], key: "r" }}
                onAction={() => {
                    if(props.config==default_config){
                        remove_LocalConfig_prev();
                        showToast({ title: "⚙️\tAlready on Default Configuration", style: Toast.Style.Success });
                    }else{
                        remove_LocalConfig_prev();
                        props.set_config(default_config);
                        showToast({ title: "⚙️\tConfiguration Reset", style: Toast.Style.Success });
                    }
                }}
            />
      </ActionPanel>
    );
  }