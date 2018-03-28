// @flow
import * as React from "react";
import { color } from "../../constants";

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
};

export default function Icon({
  children,
  className,
  onClick,
  ...rest
}: Props & BaseProps) {
  const size = rest.size ? rest.size + "px" : "24px";

  let fill = color.slateDark;
  if (rest.color) fill = rest.color;
  if (rest.light) fill = color.white;
  if (rest.black) fill = color.black;
  if (rest.primary) fill = color.primary;

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
