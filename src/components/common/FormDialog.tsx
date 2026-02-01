import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  type DialogProps,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface FormDialogProps extends Omit<DialogProps, 'onClose'> {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  saveLabel?: string;
  deleteLabel?: string;
  showDelete?: boolean;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disableSave?: boolean;
}

export function FormDialog({
  title,
  open,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
  saveLabel = 'Save',
  deleteLabel = 'Delete',
  showDelete = false,
  children,
  maxWidth = 'sm',
  disableSave = false,
  ...props
}: FormDialogProps) {
  const isLoading = isSaving || isDeleting;

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      {...props}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        {title}
        <IconButton onClick={onClose} disabled={isLoading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {showDelete && onDelete && (
          <Button
            color="error"
            onClick={onDelete}
            disabled={isLoading}
            sx={{ mr: 'auto' }}
          >
            {isDeleting ? <CircularProgress size={20} /> : deleteLabel}
          </Button>
        )}
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        {onSave && (
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isLoading || disableSave}
          >
            {isSaving ? <CircularProgress size={20} color="inherit" /> : saveLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
