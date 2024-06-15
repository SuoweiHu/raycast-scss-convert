import { useEffect, useState } from "react";
import { Action, ActionPanel, Detail, Icon, List, Toast, showToast, useNavigation } from "@raycast/api";
import { CompileConfig, CompileResult, exec_compile } from "./util_compile";
import { truncatePath_disp as truncatePath } from "./util_other";
import { CompilForm } from "./cmp_CompileForm";
import { WatchCompileAction } from "./cmp_WatchCompileAction"
import { QuickCompileAction } from "./cmp_QuickCompileAction";

export default function Command() {
    const { push, pop } = useNavigation();

    // ========================================================================================================================================
    // [EXAMPLE DATA]
    const [configs, set_configs] = useState<CompileConfig[]>([]);
    useEffect(() => {
        const test_config_1: CompileConfig = {
            scssPath: "/Users/suowei_hu/Downloads/style.scss",
            cssPath: "/Users/suowei_hu/Downloads/style.css",
            outputStyle: "expanded",
            sourceMap: "auto",
            watchCompile: false,
        };
        const test_config_2: CompileConfig = {
            scssPath: "/Users/suowei_hu/xxxx/yyyy/Desktop/style.scss",
            cssPath: "/Users/suowei_hu/mmm/nnnn/Desktop/style.css",
            outputStyle: "compressed",
            sourceMap: "none",
            watchCompile: true,
        };
        set_configs([test_config_1, test_config_2, test_config_2, test_config_2]);
    }, []);
    // ========================================================================================================================================

    return (
        <List
            navigationTitle="Convert SCSS to CSS"
            searchBarPlaceholder="Search by filename or directory"
        >
            {configs.map((config, config_index) => (
                <List.Item
                    key={`config_${config_index}`}
                    keywords={[...config.scssPath.split("/"), ...config.cssPath.split("/")]}
                    title={{ value: truncatePath(config.scssPath), tooltip: config.scssPath }}
                    subtitle={{ value: truncatePath(config.cssPath), tooltip: config.cssPath }}
                    icon={config.watchCompile ? { source: Icon.CheckCircle } : { source: Icon.Circle }}
                    accessories={config.outputStyle == "compressed" ? [{ tag: "Minified" }] : []}
                    actions={
                        <ActionPanel>
                            <Action
                                title="Compile"
                                onAction={() => {
                                    exec_compile(config)
                                        .then(() => {
                                            showToast({ title: `Compile is a Success !`, style: Toast.Style.Success });
                                        })
                                        .catch((result: CompileResult) => {
                                            showToast({ title: `Compile Failed: ${result.message} !`, style: Toast.Style.Failure });
                                        });
                                }}
                            />
                            <Action.Push
                                title="New Compile Configuration"
                                shortcut={{ modifiers: ["cmd"], key: "n" }}
                                target={
                                    <CompilForm
                                        FormAction={WatchCompileAction}
                                        show_watchOption={true}
                                        restore_prevConfig={false} />
                                }
                            />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}