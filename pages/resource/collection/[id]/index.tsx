import React from "react";
import { GetServerSideProps } from "next";

import {
	prisma,
	serializeUpdatedAt,
	serializeCreatedAt,
	selectResourcePageProps,
	selectCollectionVersionOverviewProps,
	countCollectionVersions,
} from "utils/server/prisma";
import { getResourcePagePermissions } from "utils/server/permissions";

import {
	ResourcePageParams,
	getProfileSlug,
	CollectionPageProps,
	CollectionVersionProps,
} from "utils/shared/propTypes";
import { LocationContext } from "utils/client/hooks";
import { CollectionPageFrame, CollectionVersionOverview } from "components";
import { Paragraph } from "evergreen-ui";

type CollectionOverviewProps = CollectionPageProps & {
	latestVersion: CollectionVersionProps | null;
};

export const getServerSideProps: GetServerSideProps<
	CollectionOverviewProps,
	ResourcePageParams
> = async (context) => {
	const { id } = context.params!;

	const collectionWithVersion = await prisma.collection.findUnique({
		where: { id },
		select: {
			...selectResourcePageProps,
			versions: {
				take: 1,
				orderBy: { createdAt: "desc" },
				select: selectCollectionVersionOverviewProps,
			},
		},
	});

	// The reason to check for null separately from getResourcePagePermissions
	// is so that TypeScript know it's not null afterward
	if (collectionWithVersion === null) {
		return { notFound: true };
	} else if (!getResourcePagePermissions(context, collectionWithVersion)) {
		return { notFound: true };
	}

	const versionCount = await countCollectionVersions(collectionWithVersion);

	// if (versionCount < 1) {
	// 	const profileSlug = getProfileSlug(collectionWithVersion.agent);
	// 	return {
	// 		redirect: {
	// 			destination: buildUrl({
	// 				profileSlug,
	// 				contentSlug: collectionWithVersion.slug,
	// 				mode: "edit",
	// 			}),
	// 			permanent: false,
	// 		},
	// 	};
	// }

	// We need to take the .versions property out
	// before returning as a prop so that react doesn't
	// complain about not being able to serialize Dates
	const {
		versions: [latestVersion],
		...collection
	} = collectionWithVersion;

	return {
		props: {
			versionCount,
			collection: serializeUpdatedAt(collection),
			latestVersion: latestVersion === undefined ? null : serializeCreatedAt(latestVersion),
		},
	};
};

const CollectionOverviewPage: React.FC<CollectionOverviewProps> = ({ latestVersion, ...props }) => {
	const profileSlug = getProfileSlug(props.collection.agent);
	const contentSlug = props.collection.slug;
	return (
		<LocationContext.Provider value={{ profileSlug, contentSlug }}>
			<CollectionPageFrame {...props}>
				{latestVersion === null ? (
					<Paragraph>No versions</Paragraph>
				) : (
					<CollectionVersionOverview {...latestVersion} />
				)}
			</CollectionPageFrame>
		</LocationContext.Provider>
	);
};

export default CollectionOverviewPage;
