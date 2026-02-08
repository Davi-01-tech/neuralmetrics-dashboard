import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TestPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
      </Card>
      <Button>Click Me</Button>
    </div>
  );
}