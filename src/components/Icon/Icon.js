// @flow
import * as React from "react";
import { withTheme } from "styled-components";

export type Props = {
  className?: string,
  light?: boolean,
  black?: boolean,
  primary?: boolean,
  color?: string,
  size?: number,
  onClick?: Function,
};

type BaseProps = {
  children?: React.Node,
  theme: Object,
};

function Icon({
  children,
  className,
  onClick,
  theme,
  ...rest
}: Props & BaseProps) {
  const size = rest.size ? rest.size + "px" : "24px";

  let fill = theme.slateDark;
  if (rest.color) fill = rest.color;
  if (rest.light) fill = theme.white;
  if (rest.black) fill = theme.black;
  if (rest.primary) fill = theme.primary;

  return (
    <svg
      fill={fill}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      {children}
    </svg>
  );
}

export default withTheme(Icon);
