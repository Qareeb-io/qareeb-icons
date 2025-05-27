import { FC } from "react";
import { IconDefinition } from "./iconDefinitions";
import { Size, SizeMap } from "./common";

interface QareebIconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconDefinition;
  size?: number | Size;
  viewBox?: string;
  className?: string;
  style?: React.CSSProperties;
  xmlns?: string;
  "data-icon"?: string;
}

const QareebIcon: FC<QareebIconProps> = ({
  icon,
  className = "",
  size,
  ...props
}) => {
  const [w, h, , , paths, attrs] = icon.icon;

  if (size) {
    let newSize = 0;

    if (typeof size === "number") size = size;
    else size = SizeMap[size] || 0;

    props.width = size;
    props.height = (h / w) * size + "px";
  } else {
    props.width = "1em";
    props.height = h / w + "em";
  }

  return (
    <svg
      {...props}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-icon={icon.name}
    >
      {Array.isArray(paths) ? (
        paths.map((d, i) => <path key={i} d={d} {...attrs} />)
      ) : (
        <path d={paths} {...attrs} />
      )}
    </svg>
  );
};

export default QareebIcon;
