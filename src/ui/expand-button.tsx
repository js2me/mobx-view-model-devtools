import { cx } from 'yummies/css';
import css from '@/styles.module.css';

export const ExpandButton = ({
  expandable,
  expanded,
  onClick,
  disabled,
}: {
  expandable?: boolean;
  expanded?: boolean;
  onClick?: VoidFunction;
  disabled?: boolean;
}) => {
  return (
    <span
      onClick={onClick}
      className={cx(css.expandButton, {
        [css.expandable]: expandable,
        [css.expanded]: expanded,
        [css.disabled]: disabled,
      })}
    >
      {/* {expandable && (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M6.705 11.823a.73.73 0 0 1-1.205-.552V4.729a.73.73 0 0 1 1.205-.552L10.214 7.2a1 1 0 0 1 .347.757v.084a1 1 0 0 1-.347.757z"
            clip-rule="evenodd"
          />
        </svg>
      )} */}
      {expandable && (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M5.47 13.03a.75.75 0 0 1 0-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0"
            clip-rule="evenodd"
          />
        </svg>
      )}
    </span>
  );
};
