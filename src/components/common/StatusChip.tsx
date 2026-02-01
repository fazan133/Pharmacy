import { Chip, type ChipProps } from '@mui/material';

interface StatusChipProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  size?: ChipProps['size'];
}

export function StatusChip({
  active,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  size = 'small',
}: StatusChipProps) {
  return (
    <Chip
      label={active ? activeLabel : inactiveLabel}
      color={active ? 'success' : 'default'}
      size={size}
      variant="outlined"
    />
  );
}
