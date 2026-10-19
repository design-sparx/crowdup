import {useId} from "react";
import {Form} from "react-router";
import {SubmitButton} from "@/features/admin/submit-button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

export interface AdminUser {
    id: string;
    displayName: string;
    role: string;
    suspended: boolean;
    suspendedReason: string | null;
}

interface UsersTabProps {
    users: AdminUser[];
    /** The signed-in admin's id. Their own row never offers suspension. */
    selfId: string;
}

/** Every account. An active account can be suspended with a reason; a suspended one unsuspended. */
export function UsersTab({users, selfId}: UsersTabProps) {
    if (users.length === 0) {
        return <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">No users yet.</p>;
    }
    return (
        <div className="space-y-4">
            {users.map((u) => (
                <UserCard key={u.id} user={u} isSelf={u.id === selfId}/>
            ))}
        </div>
    );
}

function UserCard({user, isSelf}: {user: AdminUser; isSelf: boolean}) {
    const reasonId = useId();
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {user.displayName}
                    <Badge variant="outline">{user.role}</Badge>
                    {user.suspended ? <Badge variant="destructive">suspended</Badge> : null}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isSelf ? (
                    <p className="text-sm text-muted-foreground">This is you.</p>
                ) : user.suspended ? (
                    <Form method="post" className="space-y-3">
                        {user.suspendedReason ? <p className="text-sm text-muted-foreground">Reason: {user.suspendedReason}</p> : null}
                        <input type="hidden" name="userId" value={user.id}/>
                        <SubmitButton name="intent" value="unsuspend" variant="outline" size="sm">Unsuspend</SubmitButton>
                    </Form>
                ) : (
                    <Form method="post" className="space-y-3">
                        <input type="hidden" name="userId" value={user.id}/>
                        <div className="space-y-2">
                            <Label htmlFor={reasonId}>Reason for suspending</Label>
                            <Textarea id={reasonId} name="reason" rows={2}/>
                        </div>
                        <SubmitButton name="intent" value="suspend" variant="destructive" size="sm">Suspend</SubmitButton>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}
