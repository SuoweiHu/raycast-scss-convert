import { ReactNode, useEffect, useState } from "react";
import { CompileConfig, default_config, get_LocalConfig_prev } from "./util_compile";
import { Form, Toast, showToast } from "@raycast/api";
import fs from "fs";

export function compilForm(form_action: ReactNode, show_watchOption: boolean, restore_prevConfig: boolean) {
  // state declaration
  const [isLoading, set_isLoading] = useState<boolean>(true);
  const [config, set_config] = useState<CompileConfig>(default_config);

  // get last (previous) compiled configuration from LocalStorage
  useEffect(() => {
    get_LocalConfig_prev().then((values) => {
      if (restore_prevConfig) {
        const prev_scssPath: string = values[0] == undefined ? "" : values[0];
        const prev_cssPath: string = values[1] == undefined ? "" : values[1];
        const prev_outputStyle: string = values[2] == undefined ? "" : values[2];
        const prev_sourceMap: string = values[3] == undefined ? "" : values[3];
        const prev_watchCompile: boolean = values[4] == undefined ? false : values[3]!.toString() === "1";
        set_config({
          scssPath: prev_scssPath,
          cssPath: prev_cssPath,
          outputStyle: prev_outputStyle,
          sourceMap: prev_sourceMap,
          watchCompile: prev_watchCompile,
        });
      }
      set_isLoading(false);
    });
  }, [isLoading]);

  // return react component
  return (
    <Form navigationTitle="Compile SCSS to CSS" isLoading={isLoading} actions={form_action}>
      <Form.Description title="" text={` `} />
      <Form.FilePicker
        id="scssPath"
        title="Source (SCSS)"
        allowMultipleSelection={false}
        canChooseDirectories
        canChooseFiles={true}
        error={config.scssPath == "" ? "SCSS Path is Required" : undefined}
        value={config.scssPath == "" ? [] : [config.scssPath]}
        onChange={(data) => {
          if (data[0] != undefined) {
            if (!fs.existsSync(data[0]) || fs.lstatSync(data[0]).isDirectory()) {
              if (fs.existsSync(data[0] + "/style.scss")) {
                set_config((conf) => ({ ...conf, scssPath: data[0] + "/style.scss" }));
                showToast({ title: `📁\tUsing "style.scss" in the directory` });
              } else {
                showToast({ title: `⚠️\tNo "scss file" can be found in the directory`, style: Toast.Style.Failure });
              }
            } else {
              if (data[0].toLowerCase().endsWith(".scss")) {
                set_config((conf) => ({ ...conf, scssPath: data[0] }));
              } else {
                showToast({ title: `⚠️\tPlease select "scss file" or "directory"`, style: Toast.Style.Failure });
              }
            }
          } else {
            set_config((conf) => ({ ...conf, scssPath: "" }));
          }
        }}
        info={`If a directory is chosen for the "source", then the command will by default pick the "style.scss" as source file.`}
      />
      <Form.FilePicker
        id="cssPath"
        title="Target (CSS)"
        allowMultipleSelection={false}
        canChooseDirectories
        canChooseFiles={true}
        error={config.cssPath == "" ? "CSS Path is Required" : undefined}
        value={config.cssPath == "" ? [] : [config.cssPath]}
        onChange={(data) => {
          if (data[0] != undefined) {
            if (!fs.existsSync(data[0]) || fs.lstatSync(data[0]).isDirectory()) {
              set_config((conf) => ({ ...conf, cssPath: data[0] + "/style.css" }));
              showToast({ title: `📁\tUsing "style.css" in the directory` });
            } else {
              if (data[0].toLowerCase().endsWith(".css")) {
                set_config((conf) => ({ ...conf, cssPath: data[0] }));
              } else {
                showToast({ title: `⚠️\tPlease select "css file" or "directory"`, style: Toast.Style.Failure });
              }
            }
          } else {
            set_config((conf) => ({ ...conf, cssPath: "" }));
          }
        }}
        info={`If a directory is chosen for the "target", then the command will by default pick the "style.css" as the target file`}
      />
      <Form.Dropdown
        id="outputStyle"
        title="Output Style"
        value={config.outputStyle}
        onChange={(data) => {
          set_config((conf) => ({ ...conf, outputStyle: data }));
        }}
        info={`Minified Output (CSS) will save a compressed version of CSS file where unnecessary characters (like whitespace, comments, and formatting) are removed to reduce file size.`}
      >
        <Form.Dropdown.Item value="expanded" title="Expanded (default)" />
        <Form.Dropdown.Item value="compressed" title="Compressed" />
      </Form.Dropdown>
      <Form.Dropdown
        id="sourceMap"
        title="Source Map Type"
        value={config.sourceMap}
        onChange={(data) => {
          set_config((conf) => ({ ...conf, sourceMap: data }));
        }}
        info={`A source map is a file that maps from the transformed or compiled version of your code back to the original source files, enabling developers to view and debug their original source code directly in the browser's developer tools, despite the code actually running being minified or compiled.`}
      >
        <Form.Dropdown.Item value="file" title="File" />
        <Form.Dropdown.Item value="inline" title="Inline" />
        <Form.Dropdown.Item value="auto" title="Auto (default)" />
        <Form.Dropdown.Item value="none" title="None" />
      </Form.Dropdown>
      {show_watchOption ? (
        <Form.Checkbox
          id="watchCompile"
          label={`--watch\t\t\t(Recompile when file changes?)`}
          value={config.watchCompile}
          onChange={(data) => {
            set_config((conf) => ({ ...conf, watchCompile: data }));
          }}
        />
      ) : (
        <></>
      )}
    </Form>
  );
}
