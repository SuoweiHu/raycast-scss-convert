import { Action, ActionPanel, Toast, showHUD, showToast, useNavigation } from "@raycast/api";
import { CompileConfig, CompileResult, add_LocalConfig_watch, default_config, exec_compile, remove_LocalConfig_prev, set_LocalConfig_prev } from "./util_compile";
import { Dispatch } from "react";

// Action for the watch compile form
export function WatchCompileAction(
    props:{
        config:CompileConfig,
        set_config:Dispatch<React.SetStateAction<CompileConfig>>
        pop_callBack?: Function,
    }
) {
    const {push, pop} = useNavigation();
    return (
      <ActionPanel>
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
            add_LocalConfig_watch(cur_config)
                .then(()=>{showToast({ title: "⚙️\tConfiguration Saved", style: Toast.Style.Success });props.pop_callBack!();pop();})
                .catch(()=>{showToast({ title: "⚙️\tConfiguration Already Exist", style: Toast.Style.Failure });});
          {}}}
        />
      </ActionPanel>
    );
  }