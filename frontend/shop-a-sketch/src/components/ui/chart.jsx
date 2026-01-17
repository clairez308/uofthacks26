"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" };

const ChartContext = React.createContext(null);

function useChart() {
    const context = React.useContext(ChartContext);

    if (!context) {
        throw new Error("useChart must be used within a <ChartContainer />");
    }

    return context;
}

export function ChartContainer({
    id,
    className,
    children,
    config,
    style,
    ...props
}) {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-slot="chart"
                data-chart={chartId}
                style={{
                    display: 'flex',
                    aspectRatio: '16/9',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    lineHeight: '1rem',
                    ...style,
                }}
                className={className}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>
                    {children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    );
}

const ChartStyle = ({ id, config }) => {
    const colorConfig = Object.entries(config).filter(
        ([, itemConfig]) => itemConfig.theme || itemConfig.color,
    );

    if (!colorConfig.length) {
        return null;
    }

    const styleContent = Object.entries(THEMES)
        .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                    .map(([key, itemConfig]) => {
                        const color = itemConfig.theme?.[theme] || itemConfig.color;
                        return color ? `  --color-${key}: ${color};` : null;
                    })
                    .join("\n")}
}
`,
        )
        .join("\n");

    return <style dangerouslySetInnerHTML={{ __html: styleContent }} />;
};

export const ChartTooltip = RechartsPrimitive.Tooltip;

export function ChartTooltipContent({
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
    style,
}) {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
        if (hideLabel || !payload?.length) {
            return null;
        }

        const [item] = payload;
        const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const value = !labelKey && typeof label === "string"
            ? (config[label]?.label || label)
            : itemConfig?.label;

        if (labelFormatter) {
            return (
                <div style={{ fontWeight: 500, ...style }} className={labelClassName}>
                    {labelFormatter(value, payload)}
                </div>
            );
        }

        if (!value) {
            return null;
        }

        return (
            <div style={{ fontWeight: 500, ...style }} className={labelClassName}>
                {value}
            </div>
        );
    }, [
        label,
        labelFormatter,
        payload,
        hideLabel,
        labelClassName,
        config,
        labelKey,
        style,
    ]);

    if (!active || !payload?.length) {
        return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
        <div
            style={{
                border: '1px solid color-mix(in oklch, var(--border) 50%, transparent)',
                backgroundColor: 'var(--background)',
                display: 'grid',
                minWidth: '8rem',
                alignItems: 'start',
                gap: '0.375rem',
                borderRadius: 'var(--radius)',
                padding: '0.625rem 0.625rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                ...style,
            }}
            className={className}
        >
            {!nestLabel ? tooltipLabel : null}
            <div style={{ display: 'grid', gap: '0.375rem' }}>
                {payload.map((item, index) => {
                    const key = `${nameKey || item.name || item.dataKey || "value"}`;
                    const itemConfig = getPayloadConfigFromPayload(config, item, key);
                    const indicatorColor = color || item.payload?.fill || item.color;

                    return (
                        <div
                            key={item.dataKey || index}
                            style={{
                                display: 'flex',
                                width: '100%',
                                flexWrap: 'wrap',
                                alignItems: 'stretch',
                                gap: '0.5rem',
                                ...(indicator === 'dot' ? { alignItems: 'center' } : {}),
                            }}
                        >
                            {formatter && item?.value !== undefined && item.name ? (
                                formatter(item.value, item.name, item, index, item.payload)
                            ) : (
                                <>
                                    {itemConfig?.icon ? (
                                        React.createElement(itemConfig.icon)
                                    ) : (
                                        !hideIndicator && (
                                            <div
                                                style={{
                                                    flexShrink: 0,
                                                    borderRadius: '2px',
                                                    border: indicator === 'dashed' ? '1.5px dashed' : 'none',
                                                    backgroundColor: indicator === 'dashed' ? 'transparent' : indicatorColor,
                                                    borderColor: indicatorColor,
                                                    width: indicator === 'dot' ? '0.625rem' : indicator === 'line' ? '0.25rem' : '0',
                                                    height: indicator === 'dot' ? '0.625rem' : 'auto',
                                                    marginTop: nestLabel && indicator === 'dashed' ? '0.125rem' : 0,
                                                    marginBottom: nestLabel && indicator === 'dashed' ? '0.125rem' : 0,
                                                }}
                                            />
                                        )
                                    )}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flex: 1,
                                            justifyContent: 'space-between',
                                            lineHeight: '1',
                                            ...(nestLabel ? { alignItems: 'flex-end' } : { alignItems: 'center' }),
                                        }}
                                    >
                                        <div style={{ display: 'grid', gap: '0.375rem' }}>
                                            {nestLabel ? tooltipLabel : null}
                                            <span style={{ color: 'var(--muted-foreground)' }}>
                                                {itemConfig?.label || item.name}
                                            </span>
                                        </div>
                                        {item.value && (
                                            <span style={{
                                                color: 'var(--foreground)',
                                                fontFamily: 'monospace',
                                                fontWeight: 500,
                                                fontVariantNumeric: 'tabular-nums',
                                            }}>
                                                {item.value.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const ChartLegend = RechartsPrimitive.Legend;

export function ChartLegendContent({
    className,
    hideIcon = false,
    payload,
    verticalAlign = "bottom",
    nameKey,
    style,
}) {
    const { config } = useChart();

    if (!payload?.length) {
        return null;
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                paddingTop: verticalAlign === 'top' ? 0 : '0.75rem',
                paddingBottom: verticalAlign === 'top' ? '0.75rem' : 0,
                ...style,
            }}
            className={className}
        >
            {payload.map((item) => {
                const key = `${nameKey || item.dataKey || "value"}`;
                const itemConfig = getPayloadConfigFromPayload(config, item, key);

                return (
                    <div
                        key={item.value}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                        }}
                    >
                        {itemConfig?.icon && !hideIcon ? (
                            React.createElement(itemConfig.icon)
                        ) : (
                            <div
                                style={{
                                    height: '0.5rem',
                                    width: '0.5rem',
                                    flexShrink: 0,
                                    borderRadius: '2px',
                                    backgroundColor: item.color,
                                }}
                            />
                        )}
                        {itemConfig?.label}
                    </div>
                );
            })}
        </div>
    );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config, payload, key) {
    if (typeof payload !== "object" || payload === null) {
        return undefined;
    }

    const payloadPayload =
        "payload" in payload &&
            typeof payload.payload === "object" &&
            payload.payload !== null
            ? payload.payload
            : undefined;

    let configLabelKey = key;

    if (key in payload && typeof payload[key] === "string") {
        configLabelKey = payload[key];
    } else if (
        payloadPayload &&
        key in payloadPayload &&
        typeof payloadPayload[key] === "string"
    ) {
        configLabelKey = payloadPayload[key];
    }

    return configLabelKey in config
        ? config[configLabelKey]
        : config[key];
}

// Default export for convenience
export default {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
};