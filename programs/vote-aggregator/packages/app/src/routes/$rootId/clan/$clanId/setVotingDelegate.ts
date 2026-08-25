import {createFileRoute} from '@tanstack/react-router';
import SetVotingDelegate from '../../../../components/clan/SetVotingDelegate';

export const Route = createFileRoute('/$rootId/clan/$clanId/setVotingDelegate')(
  {
    component: SetVotingDelegate,
    beforeLoad: () => {
      return {
        title: 'Delegate voting',
      };
    },
  }
);
