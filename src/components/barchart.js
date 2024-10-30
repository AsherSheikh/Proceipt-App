import React, { Component } from 'react';
import { View } from 'react-native';
import _, { isNaN } from 'lodash';
import BarChartItem from './barchart-item';

const swatch = {
  red: '#DC1818',
  redMuted: '#FCE7E7',
  black: '#000',
  white: '#fff',
  primaryDark: '#006FFF',
  primaryDarkMuted: '#68D0FF',
  primaryLight: '#ECF9FF',
  monoLight: '#fff',
  monoLightMuted: '#9d9d9d',
  neutral: 'rgb(127,127,127)',
  monoDark: '#535353',
  monoDarkMuted: 'rgba(0,0,0,0.2)',
  monoOverlayDark: 'rgba(0,0,0,0.35)',
  monoOverlayDarker: 'rgba(0,0,0,0.8)',
  colorOverlay: 'rgba(3,176,255,0.35)',
  monoBackground: '#f2f2f2',
  lightRipple: 'rgba(255,255,255,0.2)',
  darkRipple: 'rgba(0,0,0,0.1)',
  navInactive: '#B3E7FF',
  overlayedPrimaryDark: '#001A26',
};

export default class BarChart extends Component {
  state = {
    value: 1,
    chartValues: [],
  };

  componentDidMount() {
    this.handleChartValues(this.props.data);
  }

  componentDidUpdate(prevProps, _prevState) {
    if (this.props.data !== prevProps.data) {
      this.handleChartValues(this.props.data);
    }
  }

  handleChartValues(data) {
    // this.calcChartValues();

    const maxObject = _.maxBy(data, 'value');

    const getChartValues = (oldData, maxChartObject) => {
      const calcBarHeight = (barValue, mx) => {
        const chart_height = 130;
        const maxValue = mx.value;
        if (barValue <= 0) {
          return 0;
        } else if (barValue > 0) {
          return chart_height * (barValue / maxValue);
        }
      };

      const newData = oldData.map(obj => ({
        ...obj,
        height: calcBarHeight(obj.value ? obj.value : 0, maxChartObject),
        date: obj.label,
      }));

      return newData;
    };

    const getMaxLabelValue = x => {
      const max = _.maxBy(x, 'value') ?? 0;
      const maxValue = max.value + max.value * 0.2;
      return parseInt(maxValue);
    };

    const maxLabelValue = getMaxLabelValue(this.props.data);
    const fourthQuadrant = parseInt(3 * (maxLabelValue / 4));
    const thirdQuadrant = parseInt(2 * (maxLabelValue / 4));
    const secondQuadrant = parseInt(1 * (maxLabelValue / 4));
    const firstQuadrant = parseInt(0 * (maxLabelValue / 4));

    const chartValues = getChartValues(data, maxObject);

    this.setState({
      chartValues,
      maxLabelValue: isNaN(maxLabelValue) ? '' : maxLabelValue,
      fourthQuadrant: isNaN(fourthQuadrant) ? '' : fourthQuadrant,
      thirdQuadrant: isNaN(thirdQuadrant) ? '' : thirdQuadrant,
      secondQuadrant: isNaN(secondQuadrant) ? '' : secondQuadrant,
      firstQuadrant: isNaN(firstQuadrant) ? '' : firstQuadrant,
    });
  }

  renderBars() {
    return this.state.chartValues.slice(0, 7).map((item, index) => (
      <BarChartItem
        key={`${item.id}${index}`}
        height={item.height ? item.height : 0}
        label={item.date ? item.date : '-'}
        onPress={() => {
          this.setState({ value: item.id });
        }}
        value={this.state.value === item.id ? item.value : null}
        color={this.state.value === item.id ? '#FB9505' : swatch.monoLight}
        labelColor={swatch.white}
      />
    ));
  }

  render() {
    const chart_height = 130;

    return (
      <View
        style={{
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexDirection: 'row',
          height: chart_height + 20 + chart_height * 0.2,
          // borderWidth: 1,
        }}
      >
        {this.renderBars()}
      </View>
    );
  }
}

BarChart.defaultProps = {};
