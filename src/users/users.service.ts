import { Injectable, NotFoundException } from '@nestjs/common';
// import * as moment from 'moment';
import { UpdateUserDTO } from './dto';
import { roles, UserInsert, userProfiles, userRoles, users, UserSelect } from '@/schema';
import { DrizzleService } from '@/drizzle';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDatabase();
  }

  async findOne(userWhereUniqueInput: { email?: string; id?: number }): Promise<UserSelect | null> {
    if (!userWhereUniqueInput.email) {
      return null;
    }

    const condtions = [];
    if (userWhereUniqueInput.email) {
      condtions.push(eq(users.email, userWhereUniqueInput.email));
    }
    if (userWhereUniqueInput.id) {
      condtions.push(eq(users.id, userWhereUniqueInput.id));
    }
    const result = await this.db
      .select()
      .from(users)
      .where(and(...condtions))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  async create({
    firstname,
    lastname,
    email,
    password,
    emailVerified,
  }: {
    firstname?: string;
    lastname?: string;
    email: string;
    password?: string;
    emailVerified?: boolean;
  }): Promise<UserSelect> {
    const userSave = {
      firstname,
      lastname,
      email,
      password,
      emailVerified,
    } as UserInsert;

    const userCreated = await this.db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(userSave).returning();

      // create user profile
      await tx
        .insert(userProfiles)
        .values({ userId: user.id, firstName: firstname, lastName: lastname })
        .returning();

      // assign default role to user
      const [role] = await tx.select().from(roles).where(eq(roles.name, 'user')).limit(1);

      if (!role) {
        throw new NotFoundException('Default role user not found');
      }

      await tx.insert(userRoles).values({ userId: user.id, roleId: role.id }).returning();

      return user;
    });

    return userCreated;
  }

  async update(userId: number, data: UpdateUserDTO): Promise<UserInsert> {
    let _user = await this.findOne({ id: userId });
    _user = { ..._user, ...data };
    const [userSave] = await this.db
      .update(users)
      .set(_user)
      .where(eq(users.id, userId))
      .returning();
    return userSave;
  }
}
