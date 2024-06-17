import { useEffect, useState } from "react";
import { Action, ActionPanel, Color, Icon, List, Toast, showToast, useNavigation } from "@raycast/api";
import {
  CompileConfig,
  CompileResult,
  exec_compile,
  exec_pause,
  exec_watch,
  getAll_LocalConfig_watch,
  removeAll_LocalConfigs_watch,
  remove_LocalConfig_watch,
  set_LocalConfig_prev,
  update_LocalConfig_watch,
} from "./util_compile";
import { delayOperation, truncatePath_disp as truncatePath } from "./util_other";
import { CompilForm } from "./cmp_CompileForm";
import { WatchCompileAction } from "./cmp_WatchCompileAction";

export default function Command() {
  const { push } = useNavigation();
  const [configs, set_configs] = useState<CompileConfig[]>([]);
  const [needReload, set_needReload] = useState<boolean>(true);
  useEffect(() => {
    getAll_LocalConfig_watch().then((config) => {
      set_configs(config);
    });
    set_needReload(false);
  }, [needReload]);

  return (
    <List
      navigationTitle="Convert SCSS to CSS"
      searchBarPlaceholder="Search by filename or directory"
      isLoading={needReload}
    >
      {configs == undefined || configs.length == 0 ? (
        <List.EmptyView
          icon={Icon.CodeBlock}
          title={`Add New Configuration via "⌘ + N"`}
          actions={
            <ActionPanel>
              <Action.Push
                title="New Compile Configuration"
                shortcut={{ modifiers: ["cmd"], key: "n" }}
                target={<CompilForm
                    FormAction={WatchCompileAction}
                    show_watchOption={true}
                    restore_prevConfig={false}
                    pop_callBack={() => {set_needReload(true);}}
                    />}
              />
            </ActionPanel>
          }
        />
      ) : (
        configs.map((config: CompileConfig, config_index) => (
          <List.Item
            key={`config_${config_index}`}
            keywords={[...config.scssPath.split("/"), ...config.cssPath.split("/")]}
            title={{ value: "[SCSS] " + truncatePath(config.scssPath), tooltip: config.scssPath }}
            subtitle={{ value: "[CSS] " + truncatePath(config.cssPath), tooltip: config.cssPath }}
            icon={config.watchCompile ? { source: Icon.CheckCircle, tintColor: Color.Green } : { source: Icon.Circle }}
            accessories={[
              config.outputStyle == "compressed" ? { tag: "Minified" } : {},
            //   { tag: (config_index + 1).toString() },
            ]}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action
                    title="Compile"
                    icon={Icon.CheckCircle}
                    onAction={() => {
                      showToast({ title: `Compiling...`, style: Toast.Style.Animated });
                      exec_compile(config)
                        .then(() => {
                          delayOperation(500).then(() => {
                            set_LocalConfig_prev(config);
                            showToast({ title: `Success !`, style: Toast.Style.Success });
                          });
                        })
                        .catch((result: CompileResult) => {
                          showToast({ title: `Compile Failed: ${result.message} !`, style: Toast.Style.Failure });
                        });
                    }}
                  />
                  {!config.watchCompile ? (
                    <Action
                      title="Watch"
                      icon={Icon.CheckCircle}
                      onAction={() => {
                        showToast({ title: `Watching...`, style: Toast.Style.Animated });
                        exec_watch(config).then(() => {
                          delayOperation(500)
                            .then(() => {
                              update_LocalConfig_watch(config, { ...config, watchCompile: true }).then(() => {
                                set_needReload(true);
                              });
                              delayOperation(500).then(() => {
                                showToast({ title: `Watched !`, style: Toast.Style.Success });
                              });
                            })
                            .catch(() => {
                              showToast({ title: `Failed !`, style: Toast.Style.Failure });
                            });
                        });
                      }}
                    />
                  ) : (
                    <Action
                      title="Stop Watch"
                      icon={Icon.CheckCircle}
                      onAction={() => {
                        showToast({ title: `Stopping...`, style: Toast.Style.Animated });
                        exec_pause(config)
                          .then((data:CompileResult) => {
                            update_LocalConfig_watch(config, { ...config, watchCompile: false }).then(() => {
                              set_needReload(true);
                            });
                            delayOperation(500).then(() => {
                              showToast({ title: `Stopped ! (${data.message})`, style: Toast.Style.Success });
                            });
                          })
                          .catch(() => {
                            showToast({ title: `Failed !`, style: Toast.Style.Failure });
                          });
                      }}
                    />
                  )}
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action.Open
                    title="Open SCSS File"
                    target={config.scssPath}
                    shortcut={{modifiers:["cmd"], key:"o"}}
                  />
                  <Action.Open
                    title="Open CSS File"
                    target={config.cssPath}
                    shortcut={{modifiers:["cmd", "shift"], key:"o"}}
                    onOpen={(data)=>{console.log(data);}}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action.Push
                    title="Add Configuration"
                    icon={Icon.PlusCircle}
                    shortcut={{ modifiers: ["cmd"], key: "n" }}
                    target={
                      <CompilForm
                        FormAction={WatchCompileAction}
                        show_watchOption={true}
                        restore_prevConfig={false}
                        pop_callBack={() => {
                          set_needReload(true);
                        }}
                      />
                    }
                  />
                  <Action
                    title="Edit Configuration"
                    icon={Icon.PlusCircle}
                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                    onAction={() => {
                      push(
                        <CompilForm
                          FormAction={WatchCompileAction}
                          show_watchOption={true}
                          restore_prevConfig={false}
                          pop_callBack={() => {
                            set_needReload(true);
                          }}
                          prefill_config={config}
                          delete_prefill={true}
                        />,
                      );
                    }}
                  />
                  <Action
                    title="Duplicate Configuration"
                    icon={Icon.PlusCircle}
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                    onAction={() => {
                      push(
                        <CompilForm
                          FormAction={WatchCompileAction}
                          show_watchOption={true}
                          restore_prevConfig={false}
                          pop_callBack={() => {
                            set_needReload(true);
                          }}
                          prefill_config={config}
                          delete_prefill={false}
                        />,
                      );
                    }}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action
                    title="Remove Configuration"
                    icon={Icon.MinusCircle}
                    shortcut={{ modifiers: ["ctrl"], key: "x" }}
                    onAction={() => {
                      remove_LocalConfig_watch(config).then(() => {
                        set_needReload(true);
                      });
                    }}
                  />
                  <Action
                    title="Remove All Configuration"
                    icon={Icon.MinusCircle}
                    shortcut={{ modifiers: ["ctrl", "shift"], key: "x" }}
                    onAction={() => {
                      removeAll_LocalConfigs_watch().then(() => {
                        set_needReload(true);
                      });
                    }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
