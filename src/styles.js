import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(10, 'auto'),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default useStyles;
