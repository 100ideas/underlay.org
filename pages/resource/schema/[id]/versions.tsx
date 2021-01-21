import React from "react";

import { GetServerSideProps } from "next";

import { SchemaPageFrame, SchemaVersionHistory } from "components";
import { getResourcePagePermissions } from "utils/server/permissions";

import {
	prisma,
	selectResourcePageProps,
	countSchemaVersions,
	serializeUpdatedAt,
} from "utils/server/prisma";
import { getProfileSlug, ResourcePageParams, SchemaPageProps } from "utils/shared/propTypes";

import { LocationContext } from "utils/client/hooks";

type SchemaVersionsProps = SchemaPageProps;

export const getServerSideProps: GetServerSideProps<
	SchemaVersionsProps,
	ResourcePageParams
> = async (context) => {
	const { id } = context.params!;

	const schema = await prisma.schema.findFirst({
		where: { id },
		select: selectResourcePageProps,
	});

	if (schema === null) {
		return { notFound: true };
	} else if (!getResourcePagePermissions(context, schema)) {
		return { notFound: true };
	}

	const versionCount = await countSchemaVersions(schema);
	return {
		props: {
			schema: serializeUpdatedAt(schema),
			versionCount,
		},
	};
};

const SchemaVersionsPage: React.FC<SchemaVersionsProps> = (props) => {
	const profileSlug = getProfileSlug(props.schema.agent);
	const contentSlug = props.schema.slug;

	return (
		<LocationContext.Provider value={{ profileSlug, contentSlug, mode: "versions" }}>
			<SchemaPageFrame {...props}>
				<SchemaVersionHistory {...props} />
			</SchemaPageFrame>
		</LocationContext.Provider>
	);
};

export default SchemaVersionsPage;