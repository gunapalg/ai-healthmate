import { HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useNavigate } from 'react-router-dom';

interface HelpTooltipProps {
  section: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const HelpTooltip = ({ section, description, position = 'top', size = 'sm' }: HelpTooltipProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/help#${section}`);
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-primary/10"
            onClick={handleClick}
          >
            <HelpCircle className={`${iconSize} text-muted-foreground hover:text-primary transition-colors`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={position} className="max-w-xs">
          <p className="text-sm">{description}</p>
          <p className="text-xs text-muted-foreground mt-1">Click to learn more</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HelpTooltip;
