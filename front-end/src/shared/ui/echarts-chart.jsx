import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

export const EChartsChart = ({
  option,
  className = "",
  ariaLabel = "Chart",
}) => {
  const elementRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    chartRef.current = echarts.init(element);
    const observer = new ResizeObserver(() => chartRef.current?.resize());
    observer.observe(element);

    return () => {
      observer.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true, lazyUpdate: true });
  }, [option]);

  return (
    <div
      ref={elementRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
};
