import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSavedPicks, updatePickStatus } from '@/api/prompt.js';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Define the SavedPick type locally
interface SavedPick {
  id: number;
  play_text: string;
  reasoning: string | null;
  status: 'pending' | 'hit' | 'miss';
  created_at: string;
  updated_at: string;
  sport: string | null;
  bet_type: string | null;
  metadata: any;
  prompt_log_id: number | null;
}

export function SavedPicks() {
  const [picks, setPicks] = useState<SavedPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [updatingPick, setUpdatingPick] = useState<number | null>(null);

  const fetchPicks = async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getSavedPicks({
        status: status !== 'all' ? status as any : undefined,
        limit,
        offset: (page - 1) * limit
      });

      console.log("savedPickes===", result.savedPicks)
      setPicks(result.savedPicks);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved picks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPicks(activeTab);
  }, [activeTab, page]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  const handleStatusUpdate = async (pickId: number, status: 'pending' | 'hit' | 'miss') => {
    setUpdatingPick(pickId);

    try {
      await updatePickStatus({ pickId, status });

      // Update the pick in the local state
      setPicks(picks.map(pick =>
        pick.id === pickId ? { ...pick, status } : pick
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pick status');
    } finally {
      setUpdatingPick(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>My Saved Picks</CardTitle>
          <CardDescription>
            Track your saved picks and update their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="hit">Hits</TabsTrigger>
              <TabsTrigger value="miss">Misses</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                  {error}
                </div>
              ) : picks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No picks found. Save some picks to see them here.
                </div>
              ) : (
                <div className="space-y-4">
                  {picks.map(pick => (
                    <Card key={pick.id} className="overflow-hidden">
                      <div className={`h-1 ${
                        pick.status === 'hit' ? 'bg-green-500' :
                        pick.status === 'miss' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{pick.reasoning}</CardTitle>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {pick.sport && <span className="mr-2">{pick.sport}</span>}
                            <span>{format(new Date(pick.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        {pick.play_text && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {pick.play_text}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardFooter className="pt-2 flex justify-between">
                        <div className="flex items-center text-sm">
                          {pick.status === 'pending' ? (
                            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                          ) : pick.status === 'hit' ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className="capitalize">{pick.status}</span>
                        </div>
                        <div className="flex space-x-2">
                          {pick.status !== 'hit' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-500 hover:bg-green-500/10"
                              onClick={() => handleStatusUpdate(pick.id, 'hit')}
                              disabled={updatingPick === pick.id}
                            >
                              {updatingPick === pick.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Hit'}
                            </Button>
                          )}
                          {pick.status !== 'miss' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-500/10"
                              onClick={() => handleStatusUpdate(pick.id, 'miss')}
                              disabled={updatingPick === pick.id}
                            >
                              {updatingPick === pick.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Miss'}
                            </Button>
                          )}
                          {pick.status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                              onClick={() => handleStatusUpdate(pick.id, 'pending')}
                              disabled={updatingPick === pick.id}
                            >
                              {updatingPick === pick.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Pending'}
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-2">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
