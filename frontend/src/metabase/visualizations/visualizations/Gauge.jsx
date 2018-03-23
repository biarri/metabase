/* @flow */

import React, { Component } from "react";
import { t } from "c-3po";
import { ChartSettingsError } from "metabase/visualizations/lib/errors";
import d3 from "d3";

const percentageToDegrees = perc => perc * 360;
const degreesToRads = deg => deg * Math.PI / 180;
const percentToRads = perc => degreesToRads(percentageToDegrees(perc));

const Radial = (props) => {
  const arc = d3.svg.arc()
      .innerRadius(props.innerRadius)
      .outerRadius(props.outerRadius)
      .startAngle(props.startAngle)
      .endAngle(props.endAngle);
  return (
      <g transform={props.transform}>
        <path id="2" style={{ cursor: 'pointer' }} d={arc()} {...props} />
      </g>
  );
}

import type { VisualizationProps } from "metabase/meta/types/Visualization";

export default class Gauge extends Component {
  props: VisualizationProps;

  static isSensible(cols, rows) {
    return rows.length === 1 && cols.length === 1;
  }

  static checkRenderable([{ data: { cols, rows } }], settings) {
    Object.keys(settings).forEach((key) => {
      if (!settings[key]) {
        return false;
      }
    })
  }

  static uiName = t`Steve`;
  static identifier = "steve";
  static iconName = "bolt";

  static minSize = { width: 4, height: 4 };

  static settings = {
    "steve.chartMin": {
      title: t`Minimum value of gauge`,
      widget: "number",
    },
    "steve.chartMax": {
      title: t`Maximum value of gauge`,
      widget: "number",
    },
    "steve.endFirst": {
      title: t`End of first segment`,
      widget: "number",
    },
    "steve.colourFirst": {
      title: t`Colour of first segment`,
      widget: "color",
    },
    "steve.endSecond": {
      title: t`End of second segment`,
      widget: "number",
    },
    "steve.colourSecond": {
      title: t`Colour of second segment`,
      widget: "color",
    },
    "steve.endThird": {
      title: t`End of third segment`,
      widget: "number",
    },
    "steve.colourThird": {
      title: t`Colour of third segment`,
      widget: "color",
    },
  };

  render() {
    const {
      series,
      settings,
      height,
      width,
    } = this.props;

    const valuesOfLabels = [
      settings['steve.endFirst'],
      settings['steve.endSecond'],
    ];

    const sections = [
      { fill: settings['steve.colourFirst'] },
      { fill: settings['steve.colourSecond'] },
      { fill: settings['steve.colourThird'] }
    ];

    const [{ data: { rows } }] = series;

    const fullRadius = 300;
    const chartInset = 10;
    const barWidth = 60;
    const outerRadius = fullRadius - chartInset;
    const innerRadius = outerRadius - barWidth;

    const renderSections = () => {

      let totalPercent = .75;

      const colourMappings = [
        (settings['steve.endFirst'] / settings['steve.chartMax']),
        (settings['steve.endSecond'] / settings['steve.chartMax']),
        (settings['steve.endThird'] / settings['steve.chartMax']),
      ];

      return sections.map((sectionProps, index) => {
          const prevValue = colourMappings[index - 1] || 0;
          const currentSegmentPercentage = (colourMappings[index] - prevValue) / 2;
          const arcStartRad = percentToRads(totalPercent);
          const arcEndRad = arcStartRad + percentToRads(currentSegmentPercentage);
          totalPercent += currentSegmentPercentage;
          const transform = `translate(150 , 150)`;

          return (
            <Radial
                key={index + '_radial'}
                transform={transform}
                {...sectionProps}
                width={width}
                height={height}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={arcStartRad}
                endAngle={arcEndRad}
                onClick={() => window.location = 'http://localhost:3000/dashboard/2'}
            />);
      });
    }

    const getTranslationOfValue = (value, offsetX = 0, offsetY = 0) => {
      const valueAsPercentage = value / settings['steve.chartMax'];
      const angleOfValueBar = degreesToRads((valueAsPercentage * 360) / 2);
      const translatedX = (outerRadius * Math.cos(Math.PI - angleOfValueBar)) + fullRadius;
      const translatedY = fullRadius - (outerRadius * Math.sin(Math.PI - angleOfValueBar));
      return `translate(${translatedX + offsetX}, ${translatedY + offsetY})`;
    }

    const getPositionOfLabel = (value) => {
      const valueAsPercentage = value / settings['steve.chartMax'];
      const angleOfValue = (valueAsPercentage * 360) / 2;
      const angleOfValueBar = degreesToRads(angleOfValue);
      const translatedX = ((outerRadius + 40) * Math.cos(Math.PI - angleOfValueBar)) + fullRadius;
      const translatedY = (fullRadius - 10) - (outerRadius * Math.sin(Math.PI - angleOfValueBar));
      return `translate(${translatedX}, ${translatedY})`;
    }

    const renderValueBar = () => {
      const translationValue = getTranslationOfValue(rows[0][0]);
      const valueAsPercentage = rows[0][0] / settings['steve.chartMax'];
      return <rect
        width={barWidth}
        height="5px"
        transform={`${translationValue}, rotate(${(valueAsPercentage * 360) / 2})`}
      />
    }
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        fontSize: '100%',
      }}>
        <div style={{width: '80%'}}>
          <svg viewBox="0 0 600 300">
            {renderSections()}
            {renderValueBar()}
            <text
              x={300}
              y={fullRadius * 0.75}
              textAnchor="middle"
              fontFamily="Verdana"
              fontWeight="bold"
              fontSize="4em"
            >
              {rows[0][0]}
            </text>
            {valuesOfLabels.map(label => (
              <text
                transform={
                  getPositionOfLabel(
                    label,
                  )
                }
                fontFamily="Verdana"
                fontSize="0.75em"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>
      </div>
    );
  }
}
