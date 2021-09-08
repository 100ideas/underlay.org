import React from "react";
import { GetServerSideProps } from "next";
import prisma from "prisma/db";

import { CollectionHeader } from "components";
import { ResourcePageParams } from "utils/shared/types";
// import { getLoginData } from "utils/server/auth/user";

type Props = {
	slug: string;
};

const CollectionDiscussions: React.FC<Props> = function ({ }) {
	return (
		<div>
			<CollectionHeader
				mode="discussions"	
				// details={slug}
			/>
		</div>
	);
};

export default CollectionDiscussions;

export const getServerSideProps: GetServerSideProps<Props, ResourcePageParams> = async (
	context
) => {
	// const loginData = await getLoginData(context.req);
	const { id } = context.params!;
	const collectionData = await prisma.collection.findUnique({
		where: { id: id },
	});

	if (!collectionData) {
		return { notFound: true };
	}

	return {
		props: {
			slug: collectionData.slug,
		},
	};
};