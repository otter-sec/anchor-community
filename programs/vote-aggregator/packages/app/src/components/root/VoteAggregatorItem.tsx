import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import {RootInfo} from '../../fetchers/fetchVoteAggregatorList';
import {Link} from '@tanstack/react-router';

const VoteAggregatorItem = ({root}: {root: RootInfo}) => {
  return (
    <Card>
      <CardContent>
        <Typography>
          {root.realmData.name} ({root.side})
        </Typography>
        <Typography>{root.address.toBase58()}</Typography>
      </CardContent>
      <CardActions>
        <Button
          component={Link}
          to={'/$rootId'}
          params={{rootId: root.address.toBase58()}}
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );
};

export default VoteAggregatorItem;
