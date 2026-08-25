import {Router, RouterProvider} from '@tanstack/react-router';
import {routeTree} from '../routeTree.gen';
import {useQueryClient} from '@tanstack/react-query';

const router = new Router({
  routeTree,
  context: {
    queryClient: undefined!,
  },
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const AppRouterProvider = () => {
  const queryClient = useQueryClient();
  return (
    <RouterProvider
      router={router}
      defaultPreload="intent"
      context={{
        queryClient,
      }}
    />
  );
};

export default AppRouterProvider;
