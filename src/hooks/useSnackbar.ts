import { useSnackbar } from 'notistack';

export const useNotifier = () => {
  const { enqueueSnackbar } = useSnackbar();

  const notify = (message: string, success: boolean = true) => {
    enqueueSnackbar(message, { variant: success ? 'success' : 'error' });
  };

  return { notify };
};
