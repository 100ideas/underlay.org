import React from "react";
import { GetServerSideProps } from "next";

import { SchemaPageFrame, SchemaVersionOverview } from "components";
import {
	prisma,
	selectResourcePageProps,
	selectSchemaVersionOverviewProps,
	countSchemaVersions,
	serializeUpdatedAt,
	serializeCreatedAt,
} from "utils/server/prisma";
import { getResourcePagePermissions } from "utils/server/permissions";
// import { buildUrl } from "utils/shared/urls";

import {
	SchemaPageProps,
	ResourcePageParams,
	getProfileSlug,
	SchemaVersionProps,
} from "utils/shared/propTypes";
import { LocationContext } from "utils/client/hooks";
import { Paragraph } from "evergreen-ui";

type SchemaOverviewProps = SchemaPageProps & { latestVersion: SchemaVersionProps | null };

export const getServerSideProps: GetServerSideProps<
	SchemaOverviewProps,
	ResourcePageParams
> = async (context) => {
	const { id } = context.params!;

	const schemaWithVersion = await prisma.schema.findUnique({
		where: { id },
		select: {
			...selectResourcePageProps,
			versions: {
				take: 1,
				orderBy: { createdAt: "desc" },
				select: selectSchemaVersionOverviewProps,
			},
		},
	});

	// The reason to check for null separately from getResourcePagePermissions
	// is so that TypeScript know it's not null afterward
	if (schemaWithVersion === null) {
		return { notFound: true };
	} else if (!getResourcePagePermissions(context, schemaWithVersion)) {
		return { notFound: true };
	}

	const versionCount = await countSchemaVersions(schemaWithVersion);

	// if (versionCount < 1) {
	// 	const profileSlug = getProfileSlug(schemaWithVersion.agent);
	// 	return {
	// 		redirect: {
	// 			destination: buildUrl({
	// 				profileSlug,
	// 				contentSlug: schemaWithVersion.slug,
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
		...schema
	} = schemaWithVersion;

	return {
		props: {
			versionCount,
			schema: serializeUpdatedAt(schema),
			latestVersion: latestVersion === undefined ? null : serializeCreatedAt(latestVersion),
		},
	};
};

const SchemaOverviewPage: React.FC<SchemaOverviewProps> = ({ latestVersion, ...props }) => {
	const profileSlug = getProfileSlug(props.schema.agent);
	const contentSlug = props.schema.slug;
	return (
		<LocationContext.Provider value={{ profileSlug, contentSlug }}>
			<SchemaPageFrame {...props}>
				{latestVersion === null ? (
					<Paragraph>No versions</Paragraph>
				) : (
					<SchemaVersionOverview {...latestVersion} />
				)}
			</SchemaPageFrame>
		</LocationContext.Provider>
	);
};

export default SchemaOverviewPage;
