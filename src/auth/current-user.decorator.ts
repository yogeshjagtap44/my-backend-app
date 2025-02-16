import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";

const getCurrentUserByContext = (context: ExecutionContext): User => {
    if (context.getType() === 'http') {
        return context.switchToHttp().getRequest().user;
    } else if (context.getType<GqlContextType>() === 'graphql') {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req.user;
    }
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext) => getCurrentUserByContext(context)
)