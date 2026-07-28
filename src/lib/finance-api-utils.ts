import type { Group, SharedMember, SplitGroup } from '../types';

export type ApiEnvelope<T> = {
  message: string;
  data: T;
};

type WithMongoId<T> = T & { _id?: string; id?: string };
type MongoRef = string | { _id?: string; id?: string };
type PopulatedUserRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
      profilePicture?: string;
    };

export const withId = <T extends { id: string }>(value: WithMongoId<T>): T => ({
  ...value,
  id: value.id ?? value._id ?? '',
});

export const withIds = <T extends { id: string }>(
  values: Array<WithMongoId<T>>,
) => values.map(withId);

const refId = (value: MongoRef) =>
  typeof value === 'string' ? value : (value.id ?? value._id ?? '');

const normalizeMember = (
  member: Omit<SharedMember, 'user'> & { user: PopulatedUserRef },
): SharedMember => {
  const populatedUser =
    typeof member.user === 'string' ? undefined : member.user;

  return {
    ...member,
    user: {
      id: refId(member.user),
      name: populatedUser?.name ?? '',
      email: populatedUser?.email,
      profilePicture: populatedUser?.profilePicture,
    },
  };
};

export const normalizeGroup = (group: WithMongoId<Group>): Group => ({
  ...withId(group),
  owner: refId(group.owner as MongoRef),
  members: (group.members ?? []).map(member =>
    normalizeMember(member as Parameters<typeof normalizeMember>[0]),
  ),
});

export const normalizeGroups = (groups: Array<WithMongoId<Group>>) =>
  groups.map(normalizeGroup);

export const normalizeSplitGroup = (
  splitGroup: WithMongoId<SplitGroup>,
): SplitGroup => ({
  ...withId(splitGroup),
  owner: refId(splitGroup.owner as MongoRef),
  members: (splitGroup.members ?? []).map(member =>
    normalizeMember(member as Parameters<typeof normalizeMember>[0]),
  ),
});

export const normalizeSplitGroups = (
  splitGroups: Array<WithMongoId<SplitGroup>>,
) => splitGroups.map(normalizeSplitGroup);
