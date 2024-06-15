import { ActionPanel, Action, showToast, showHUD, Toast } from "@raycast/api";
import {
  CompileConfig,
  CompileResult,
  exec_compile,
  remove_LocalConfig_prev,
  set_LocalConfig_prev,
} from "./util_compile";
import { compilForm } from "./util_compileForm";

export default function Command() {
  // Action for the compile form
  function quickCompile_Action() {
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
                set_LocalConfig_prev(cur_config);
                showHUD("✅ File has been Compiled (and Configuration Saved)");
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
        <Action.SubmitForm
          title="Reset to Default"
          shortcut={{ modifiers: ["cmd"], key: "r" }}
          onSubmit={() => {
            // console.log()
            // set_config(default_config);
            remove_LocalConfig_prev();
            showToast({ title: "⚙️\tConfiguration Reset", style: Toast.Style.Success });
          }}
        />
      </ActionPanel>
    );
  }

  return compilForm(quickCompile_Action(), false, true);
}
