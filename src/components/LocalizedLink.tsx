import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

const LocalizedLink = ({ to, children, ...props }: LocalizedLinkProps) => {
  const { localizedPath } = useLocalizedPath();
  
  return (
    <RouterLink to={localizedPath(to)} {...props}>
      {children}
    </RouterLink>
  );
};

export default LocalizedLink;
