import { useEffect, useState } from "react";
import { Action, ActionPanel, Detail, Icon, List, Toast, showToast, useNavigation } from "@raycast/api";
import { CompileConfig, CompileResult, add_LocalConfig_watch, exec_compile, getAll_LocalConfig_watch, removeAll_LocalConfigs_watch, remove_LocalConfig_watch, set_LocalConfig_prev } from "./util_compile";
import { delayOperation, truncatePath_disp as truncatePath } from "./util_other";
import { CompilForm } from "./cmp_CompileForm";
import { WatchCompileAction } from "./cmp_WatchCompileAction"
import { QuickCompileAction } from "./cmp_QuickCompileAction";

export default function Command() {
    const { push, pop } = useNavigation();













    // [EXAMPLE DATA]
    const [configs, set_configs] = useState<CompileConfig[]>([]);
    const [needReload, set_needReload] = useState<boolean>(true);
    useEffect(() => {
        const test_config_1: CompileConfig = { scssPath: "/1/Users/suowei_hu/Downloads/style.scss", cssPath: "/Users/suowei_hu/Downloads/style.css", outputStyle: "expanded", sourceMap: "auto", watchCompile: false, };
        const test_config_2: CompileConfig = { scssPath: "/2/Users/suowei_hu/xxxx/yyyy/Desktop/style.scss", cssPath: "/Users/suowei_hu/mmm/nnnn/Desktop/style.css", outputStyle: "compressed", sourceMap: "none", watchCompile: true, };
        const test_config_3: CompileConfig = { scssPath: "/3/Users/suowei_hu/xxxx/yyyy/Desktop/style.scss", cssPath: "/Users/suowei_hu/mmm/nnnn/Desktop/style.css", outputStyle: "compressed", sourceMap: "none", watchCompile: true, };
        const test_config_4: CompileConfig = { scssPath: "/4/Users/suowei_hu/xxxx/yyyy/Desktop/style.scss", cssPath: "/Users/suowei_hu/mmm/nnnn/Desktop/style.css", outputStyle: "expanded", sourceMap: "none", watchCompile: true, };
        getAll_LocalConfig_watch().then((config) => { set_configs(config); })
        set_needReload(false);
    }, [needReload]);















    return (
        <List
            navigationTitle="Convert SCSS to CSS"
            searchBarPlaceholder="Search by filename or directory"
            isLoading={needReload}
        >
            {configs == undefined || configs.length == 0 ?
                <List.EmptyView
                    icon={Icon.CodeBlock}
                    title={`Add New Configuration via "⌘ + N"`}
                    actions={
                        <ActionPanel>
                            <Action.Push
                                title="New Compile Configuration"
                                shortcut={{ modifiers: ["cmd"], key: "n" }}
                                target={
                                    <CompilForm
                                        FormAction={WatchCompileAction}
                                        show_watchOption={true}
                                        restore_prevConfig={false}
                                        pop_callBack={() => { set_needReload(true) }}
                                    />
                                }
                            />
                        </ActionPanel>
                    }
                />
                :
                configs.map((config: CompileConfig, config_index) => (
                    <List.Item
                        key={`config_${config_index}`}
                        keywords={[...config.scssPath.split("/"), ...config.cssPath.split("/")]}
                        title={{ value: truncatePath(config.scssPath), tooltip: config.scssPath }}
                        subtitle={{ value: truncatePath(config.cssPath), tooltip: config.cssPath }}
                        icon={config.watchCompile ? { source: Icon.CheckCircle } : { source: Icon.Circle }}
                        accessories={[config.outputStyle == "compressed" ? { tag: "Minified" } : {}, { tag: (config_index + 1).toString() },]}
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
                                                    delayOperation(1000);
                                                    set_LocalConfig_prev(config);
                                                    showToast({ title: `Success !`, style: Toast.Style.Success });
                                                })
                                                .catch((result: CompileResult) => {
                                                    showToast({ title: `Compile Failed: ${result.message} !`, style: Toast.Style.Failure });
                                                });
                                        }}
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
                                                pop_callBack={() => { set_needReload(true); }}
                                            />
                                        }
                                    />
                                    <Action
                                        title="Edit Configuration"
                                        icon={Icon.PlusCircle}
                                        shortcut={{ modifiers: ["cmd"], key: "e" }}
                                        onAction={()=>{
                                            push(<CompilForm
                                                FormAction={WatchCompileAction}
                                                show_watchOption={true}
                                                restore_prevConfig={false}
                                                pop_callBack={() => { set_needReload(true); }}
                                                prefill_config={config}
                                                delete_prefill={true}
                                            />);
                                        }}
                                    />
                                    <Action
                                        title="Duplicate Configuration"
                                        icon={Icon.PlusCircle}
                                        shortcut={{ modifiers: ["cmd"], key: "d" }}
                                        onAction={()=>{
                                            push(<CompilForm
                                                FormAction={WatchCompileAction}
                                                show_watchOption={true}
                                                restore_prevConfig={false}
                                                pop_callBack={() => { set_needReload(true); }}
                                                prefill_config={config}
                                                delete_prefill={false}
                                            />);
                                        }}
                                    />
                                </ActionPanel.Section>
                                <ActionPanel.Section>
                                    <Action
                                        title="Remove Configuration"
                                        icon={Icon.MinusCircle}
                                        shortcut={{ modifiers: ["ctrl"], key: "x" }}
                                        onAction={() => {
                                            remove_LocalConfig_watch(config).then(()=>{
                                                set_needReload(true);
                                            });
                                        }}
                                    />
                                    <Action
                                        title="Remove All Configuration"
                                        icon={Icon.MinusCircle}
                                        shortcut={{ modifiers: ["ctrl", "shift"], key: "x" }}
                                        onAction={() => {
                                            removeAll_LocalConfigs_watch().then(()=>{
                                                set_needReload(true);
                                            });
                                        }}
                                    />
                                </ActionPanel.Section>
                            </ActionPanel>
                        }
                    />
                ))}
        </List>
    );
}