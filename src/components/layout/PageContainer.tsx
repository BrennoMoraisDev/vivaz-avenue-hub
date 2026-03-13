import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const PageContainer = ({ children, title, subtitle, className = '' }: PageContainerProps) => {
  return (
    <div className={`px-4 py-6 md:px-8 md:py-8 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h1 className="font-heading text-2xl font-bold text-gradient-gold md:text-3xl">{title}</h1>}
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageContainer;
