import {createFileRoute} from '@tanstack/react-router';
import EditClan from '../../../../components/clan/EditClan';

export const Route = createFileRoute('/$rootId/clan/$clanId/edit')({
  component: EditClan,
  beforeLoad: () => {
    return {
      title: 'edit',
    };
  },
});
