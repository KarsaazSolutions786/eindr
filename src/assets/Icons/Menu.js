import React from "react";
import Svg, { G, Rect, Circle } from "react-native-svg";

const Menu = props => (
  <Svg width={33} height={20} viewBox="0 0 33 20" fill="none" {...props}>
    <G opacity={0.7}>
      <Rect x={1} y={1} width={31} height={18} rx={8} stroke="#fff" />
      <Circle cx={11} cy={10} r={2} fill="#fff" />
      <Circle cx={17} cy={10} r={2} fill="#fff" />
      <Circle cx={23} cy={10} r={2} fill="#fff" />
    </G>
  </Svg>
);

export default Menu;
