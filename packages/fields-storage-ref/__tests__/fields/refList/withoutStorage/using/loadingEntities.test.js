import sinon from "sinon";
import { Group, User, UsersGroups } from "../../../../resources/models/modelsUsing";
import mdbid from "mdbid";

const sandbox = sinon.createSandbox();

describe("save and delete models attribute test", () => {
    afterEach(() => sandbox.restore());
    beforeEach(() => User.getStoragePool().flush());

    test("should use correct storage queries to fetch linked models", async () => {
        const A = mdbid();
        const first = mdbid();
        const second = mdbid();
        const third = mdbid();
        const X = mdbid();
        const Y = mdbid();
        const Z = mdbid();

        let modelFindById = sandbox
            .stub(User.getStorageDriver(), "findOne")
            .callsFake(() => ({ id: A }));

        const user = await User.findById(A);
        modelFindById.restore();

        const findStub = sandbox.stub(UsersGroups.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    { id: first, user: A, group: X },
                    { id: second, user: A, group: Y },
                    { id: third, user: A, group: Z }
                ]
            ];
        });

        const findOneStub = sandbox
            .stub(Group.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: X, name: "Group X" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: Y, name: "Group Y" };
            })
            .onCall(2)
            .callsFake(() => {
                return { id: Z, name: "Group Z" };
            });

        await user.groups;

        expect(findStub.getCall(0).args[0].model).toEqual(UsersGroups);
        expect(findStub.getCall(0).args[0].options).toEqual({
            page: 1,
            perPage: 10,
            query: {
                user: A
            }
        });

        expect(findOneStub.getCall(0).args[0].model).toEqual(Group);
        expect(findOneStub.getCall(0).args[0].options).toEqual({
            query: {
                id: X
            }
        });

        expect(findOneStub.getCall(1).args[0].model).toEqual(Group);
        expect(findOneStub.getCall(1).args[0].options).toEqual({
            query: {
                id: Y
            }
        });

        expect(findOneStub.getCall(2).args[0].model).toEqual(Group);
        expect(findOneStub.getCall(2).args[0].options).toEqual({
            query: {
                id: Z
            }
        });

        findStub.restore();
        findOneStub.restore();
    });

    test("should wait until models are loaded if loading is in progress", async () => {
        const A = mdbid();
        const first = mdbid();
        const second = mdbid();
        const third = mdbid();
        const fourth = mdbid();
        const fifth = mdbid();
        const X = mdbid();
        const Y = mdbid();
        const Z = mdbid();
        const P = mdbid();
        const Q = mdbid();

        let modelFindById = sandbox
            .stub(User.getStorageDriver(), "findOne")
            .callsFake(() => ({ id: A }));
        const user = await User.findById(A);
        modelFindById.restore();

        sandbox.stub(UsersGroups.getStorageDriver(), "find").callsFake(() => {
            return [
                [
                    { id: first, user: A, group: X },
                    { id: second, user: A, group: Y },
                    { id: third, user: A, group: Z }
                ]
            ];
        });

        sandbox
            .stub(Group.getStorageDriver(), "findOne")
            .onCall(0)
            .callsFake(() => {
                return { id: X, name: "Group X" };
            })
            .onCall(1)
            .callsFake(() => {
                return { id: Y, name: "Group Y" };
            })
            .onCall(2)
            .callsFake(() => {
                return { id: Z, name: "Group Z" };
            });

        user.groups = [{ name: "Group P" }, { name: "Group Q" }];
        expect(user.getField("groups").state.loading).toBe(false);
        expect(user.getField("groups").state.loaded).toBe(false);

        let modelSave = sandbox
            .stub(user.getStorageDriver(), "save")
            .onCall(0)
            .callsFake(() => {
                return true;
            })
            .onCall(1)
            .callsFake(({ model }) => {
                model.id = P;
                return true;
            })
            .onCall(2)
            .callsFake(({ model }) => {
                model.id = fourth;
                return true;
            })
            .onCall(3)
            .callsFake(({ model }) => {
                model.id = Q;
                return true;
            })
            .onCall(4)
            .callsFake(({ model }) => {
                model.id = fifth;
                return true;
            });

        await user.save();

        modelSave.restore();

        expect(modelSave.callCount).toEqual(5);

        expect(user.getField("groups").initial).toHaveLength(2);
        expect(user.getField("groups").initial[0].id).toEqual(P);
        expect(user.getField("groups").initial[1].id).toEqual(Q);
        expect(user.getField("groups").current).toHaveLength(2);
        expect(user.getField("groups").current[0].id).toEqual(P);
        expect(user.getField("groups").current[1].id).toEqual(Q);

        expect(user.getField("groups").links.initial).toHaveLength(2);
        expect(user.getField("groups").links.initial[0].id).toEqual(fourth);
        expect(user.getField("groups").links.initial[1].id).toEqual(fifth);

        expect(user.getField("groups").links.current).toHaveLength(2);
        expect(user.getField("groups").links.current[0].id).toEqual(fourth);
        expect(user.getField("groups").links.current[1].id).toEqual(fifth);
    });
});
