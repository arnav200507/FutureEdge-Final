import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface Notice {
  id: string;
  title: string;
  content: string | null;
  is_important: boolean;
  published_at: string;
}

interface NewsCarouselProps {
  notices: Notice[];
}

const NewsCarousel = ({ notices }: NewsCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!api || isPaused || notices.length <= 1) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api, isPaused, notices.length]);

  // Update current slide index
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Don't render if no notices
  if (!notices || notices.length === 0) {
    return null;
  }

  // Limit to 5 notices max
  const displayNotices = notices.slice(0, 5);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Latest Updates</h2>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
      >
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {displayNotices.map((notice) => (
              <CarouselItem
                key={notice.id}
                className="pl-3 basis-[85%] sm:basis-[75%] md:basis-[60%]"
              >
                <Card
                  className={`h-full border transition-all ${
                    notice.is_important
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                        {notice.title}
                      </h3>
                      <Badge
                        variant={notice.is_important ? "default" : "secondary"}
                        className={`text-[10px] px-2 py-0.5 flex-shrink-0 ${
                          notice.is_important
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {notice.is_important ? "Important" : "Update"}
                      </Badge>
                    </div>

                    {notice.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notice.content}
                      </p>
                    )}

                    <p className="text-[11px] text-muted-foreground/70">
                      {formatDate(notice.published_at)}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation Arrows (Desktop) */}
        {displayNotices.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card shadow-md border-border"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-card shadow-md border-border"
              onClick={scrollNext}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {displayNotices.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-1">
          {displayNotices.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === current
                  ? "w-4 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCarousel;
