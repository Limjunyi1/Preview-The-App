import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ActivityFeed() {
  const activities = [
    {
      user: {
        name: "Emma",
        avatar: "/images/emma.png",
        initials: "EM",
      },
      action: "liked your profile",
      time: "2 min ago",
    },
    {
      user: {
        name: "Maya",
        avatar: "/images/maya.jpg",
        initials: "MY",
      },
      action: "sent you a message",
      time: "15 min ago",
    },
    {
      user: {
        name: "AI Wingman",
        avatar: null,
        initials: "AI",
      },
      action: "analyzed your chat with Sarah",
      time: "1 hour ago",
    },
    {
      user: {
        name: "Olivia",
        avatar: "/images/olivia.jpg",
        initials: "OL",
      },
      action: "viewed your profile",
      time: "3 hours ago",
    },
    {
      user: {
        name: "Priya",
        avatar: "/images/priya.png",
        initials: "PR",
      },
      action: "matched with you",
      time: "5 hours ago",
    },
  ];

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Here's what's happening in your dating life.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <div className="flex items-center" key={index}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar || ""} alt={activity.user.name} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.action}
                </p>
              </div>
              <div className="ml-auto font-medium text-xs text-muted-foreground">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

