import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Bottom sheet on phones, centred dialog on larger screens. */
export function ResponsiveModal({ open, onOpenChange, title, description, children, footer, className }: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent className={cn('max-h-[92dvh]', className)}>
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-poppins text-lg">{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : <DrawerDescription className="sr-only">{title}</DrawerDescription>}
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">{children}</div>
          {footer && <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('flex max-h-[90vh] flex-col gap-0 rounded-3xl p-0 sm:max-w-lg', className)}>
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="font-poppins text-xl">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">{children}</div>
        {footer && <div className="border-t border-border p-6 pt-4">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
