import { forwardRef } from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
({ to, children, ...props }, ref) => {
  const { localizedPath } = useLocalizedPath();
  
  return (
    <RouterLink ref={ref} to={localizedPath(to)} {...props}>
      {children}
    </RouterLink>
  );
});

LocalizedLink.displayName = 'LocalizedLink';

export default LocalizedLink;
