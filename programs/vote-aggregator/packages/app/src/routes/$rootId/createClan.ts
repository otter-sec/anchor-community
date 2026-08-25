import {createFileRoute} from '@tanstack/react-router';
import CreateClan from '../../components/clan/CreateClan';

export const Route = createFileRoute('/$rootId/createClan')({
  component: CreateClan,
  beforeLoad: () => {
    return {
      title: 'Create clan',
    };
  },
});
