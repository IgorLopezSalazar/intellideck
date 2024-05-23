export class Helper {
    static intersect(a: any[], b: any[]): any {
        let list: any = [];
        a.forEach((aObject: any) => {
            if (b.some((bObject: any) => bObject._id.toString() == aObject._id.toString())) {
                list.push(aObject);
            }
        })
        return list;
    }
}