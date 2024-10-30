import React, { Component } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

export default class BarChartItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected,
    };
    this.height = new Animated.Value(10);
  }

  componentDidMount() {
    this.animateBarHeight();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.height !== this.props.height) {
      this.animateBarHeight();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.selected !== prevProps.selected) {
      this.selectNew();
    }
  }

  animateBarHeight() {
    Animated.timing(this.height, {
      toValue: this.props.height,
      duration: 600,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    }).start();
  }

  onPress = () => {
    this.props.onPress();
  };

  render() {
    const styles = { height: this.height };
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          // borderWidth: 1,
        }}
      >
        {this.props.value ? (
          <View
            style={{
              paddingVertical: 10,
              paddingHorizontal: 10,
              minWidth: 70,
              backgroundColor: 'white',
              borderRadius: 20,
              position: 'absolute',
              zIndex: 10,
              top: -50,
              alignItems: 'center',
              elevation: 2,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                margin: 0,
                width: '100%',
                textAlign: 'center',
                fontFamily: 'Inter-Regular',
                color: '#000',
              }}
            >
              £ {Number.parseFloat(this.props.value).toFixed(2)}
            </Text>
          </View>
        ) : null}
        <RectButton
          onPress={() => this.onPress()}
          style={{ alignItems: 'center' }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: this.props.color,
                borderTopRightRadius: 5,
                borderTopLeftRadius: 5,
                height: 10,
                width: 40,
              },
              styles,
            ]}
          />
        </RectButton>
        <Text
          style={{
            color: '#fff',
            marginTop: 10,
            fontFamily: 'Inter-Regular',
            fontSize: 12,
          }}
        >
          {this.props.label}
        </Text>
      </View>
    );
  }
}

BarChartItem.defaultProps = {
  height: 10,
  label: 'M',
  selected: false,
};
