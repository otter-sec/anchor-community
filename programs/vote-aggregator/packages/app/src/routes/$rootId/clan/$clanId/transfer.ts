import {createFileRoute} from '@tanstack/react-router';
import TransferClan from '../../../../components/clan/TransferClan';


export const Route = createFileRoute('/$rootId/clan/$clanId/transfer')({
  component: TransferClan,
  beforeLoad: () => {
    return {
      title: 'transfer',
    };
  },
});
