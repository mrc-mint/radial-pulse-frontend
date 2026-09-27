import { Card, EmptyState, PageHeader } from '@radial-pulse/ui/web';
import { Construction } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * TEMPORARY route body for the platform-shell phase. Each route replaces it
 * with its real page in the application phases; delete this file once no
 * route imports it.
 */
export function PagePlaceholder({
  title,
  description,
  detail,
  embedded = false,
}: {
  title: string;
  description?: string;
  detail?: ReactNode;
  /** Inside the clinic workspace, which already renders the page heading. */
  embedded?: boolean;
}) {
  return (
    <div className="rp-page">
      {!embedded && <PageHeader title={title} description={description} />}
      <Card>
        <EmptyState
          variant="page"
          icon={<Construction size={22} />}
          title={`${title} is coming next`}
          description="The platform shell is in place. This page is built in the next implementation phase."
          action={detail}
        />
      </Card>
    </div>
  );
}
