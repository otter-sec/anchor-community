import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/$rootId/clan/$clanId')({
  beforeLoad: ({params: {clanId}}) => {
    return {
      title: 'Clan: ' + clanId,
    };
  },
});
