import { cx } from 'yummies/css';
import css from '@/styles.module.css';
import { ChevronRight } from './icons/chevron-right';

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
      {expandable && <ChevronRight />}
    </span>
  );
};
